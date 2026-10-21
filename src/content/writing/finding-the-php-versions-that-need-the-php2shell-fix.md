---
title: 'Finding the PHP versions in your repos that need the php2shell fix'
description: 'How to find every PHP version your repos declare for CVE-2026-109618 and CVE-2026-109619, and which ones need the fix. In 10 public repos, 111 of 112 labeled declarations could not prove which PHP build runs.'
pubDate: 2026-10-21
tags: ['php', 'security', 'docker', 'devops', 'php2shell']
---

php.net shipped the fixes for php2shell (CVE-2026-109618 and CVE-2026-109619) on 21 Oct. To patch, you need a list of every PHP you run, and the versions written in your repos mostly can't give you one. Across 10 public repos, 112 PHP version declarations were labeled before running the tool, and 111 of them can't prove which PHP build actually runs.

So the work splits in two: find every place a repo declares PHP, then work out which ones you can fix by changing a line and which ones you have to check on a real build.

## The fixed versions, and a 60-second check

From php.net's [advisory](https://www.php.net/archive/2026.php#2026-10-21-5):

| Branch | Fixed in |
| ------ | -------- |
| 8.5    | 8.5.12   |
| 8.4    | 8.4.27   |
| 8.3    | 8.3.36   |
| 8.2    | 8.2.35   |

8.1 and older get no official release. php.net published source backport branches for 7.4, 8.0 and 8.1 (`PHP-8.1-CVE-2026-109618-109619` in php-src, and the same pattern for the other two), and some distros and LTS vendors backport.

The advisory puts the highest risk on installs that serve web requests: PHP-FPM and mod_php first, then php-cgi, FrankenPHP and LiteSpeed. CI runners and dev machines still need the update. They're just less exposed. If you can't update yet, the advisory lists [mitigations](https://www.php.net/archive/2026.php#2026-10-21-5). php.net says they reduce exposure and don't fix the bug, so I'm linking them instead of copying them here.

To see what a host or image actually runs:

```sh
# on a server or container
php -r 'echo PHP_VERSION, PHP_EOL;'
dpkg -l 'php*' 2>/dev/null | grep ^ii    # Debian/Ubuntu packages
apk info -v 2>/dev/null | grep ^php      # Alpine packages

# for a built image
docker run --rm --entrypoint php <image> -r 'echo PHP_VERSION, PHP_EOL;'

# images on a floating tag only pick up the fix after a rebuild and redeploy
docker build --pull .
```

For official images and source builds, `PHP_VERSION` is the answer. For distro packages it isn't. Debian, Ubuntu and RHEL backport fixes without changing the upstream version, so compare the package version with your vendor's security tracker. If you install from Remi's repo, it had no updates as of 21 Oct.

## Where PHP versions hide in a repo

That check needs a list of hosts and images to run it on, and the repo is where that list comes from. Each place PHP shows up says something different about the build.

**Exact official tags.** `FROM php:8.3.30-fpm` is as close to proof as a repo gets. The docker-library images are built from source at that version, so anything built from this line runs 8.3.30. Whether that's the image you deployed is a separate question.

**Floating tags.** `FROM php:8.3-fpm` resolves at build time. You get the fix once the official image is rebuilt on 8.3.36 and you rebuild with `--pull` and redeploy. Restarting the same container keeps the old build, and so does reusing a tag with `imagePullPolicy: IfNotPresent`.

**setup-php.** `php-version: '8.3.30'` looks like a pin. setup-php installs whatever 8.3 patch is current or already on the runner, so a version at or above the fix can still run an older build. The first draft of the tool's spec treated these as exact pins. The tool treats them as floating.

**Version files.** asdf installs exactly what `.tool-versions` says, so `php 8.4.20` there is a real pin. `.php-version` is different: setup-php, Symfony CLI and Herd read it and use whatever patch is installed.

**Distro packages.** `apt-get install php8.2-cli` gets you whatever the vendor ships, and the version string won't show a backported fix.

**Images that bundle PHP.** `wordpress`, `drupal`, `nextcloud` and Laravel Sail runtimes have PHP inside and no PHP version on the `FROM` line. The fix arrives when the maintainer rebuilds and you pull.

**Composer constraints.** `"php": "^8.2"` tells Composer what the code supports. It doesn't pick the runtime. Updating Laravel, Symfony or WordPress code doesn't change the runtime either, since php2shell is in PHP itself.

**EOL branches.** 8.1 and older need action however they're declared: upgrade, take a vendor backport, or build from php.net's backport branch.

## What I measured

The corpus is 10 public PHP repos, each pinned to a commit SHA. The labels were made by reading each repo's files line by line before running the tool on it, with an AI coding assistant, in one labeling pass. They're recorded in [`results/labels.json`](https://github.com/Amsozzer1/php2shell-repo-audit/blob/main/results/labels.json), line level. Recall only covers the file types the labeling grep covered: Dockerfiles, Containerfiles, YAML, `.php-version`, `.tool-versions` and `composer.json`. The baseline is `grep -rnE "FROM +php:"`, the usual "inventory your Dockerfiles" step. I'm not publishing per-repo verdicts.

Six repos were the tuning set. On the first run the tool found 58 of 69 labeled declarations, with 3 false positives, and grep found 31. The miss worth knowing about even if you never run the tool: setup-php versions that aren't written next to setup-php. Some were set under `env:` and read back as `${{ env.php-version }}`, and some were passed as an input to a reusable workflow (`with: php-versions: "['8.3', '8.4']"`). Search a workflow for `setup-php` and you'll find the step, but the version lives somewhere else.

After fixing those gaps, the tuning set went to 70 of 70. That's tuned on the same repos, so it doesn't count. (It's 70 now because the labeling pass missed one declaration, which was added after the first run.) Then 4 more repos were labeled the same way and measured once:

| Held out: 4 repos, 42 labels, one run | Found         | False positives |
| ------------------------------------- | ------------- | --------------- |
| php2shell-repo-audit                  | 36 / 42 (86%) | 1               |
| `grep -rnE "FROM +php:"`              | 16 / 42 (38%) | 0               |

The 6 held-out misses were setup-php referenced by full URL (`uses: https://github.com/shivammathur/setup-php@v2`, common on Forgejo), an Arch `pacman -S` install, and Debian's `libapache2-mod-php`. That last one is mod_php, one of the two highest-risk setups in the advisory, and its package name doesn't start with `php`. All 6 are fixed in the release, so 36 of 42 measures the code from before those fixes.

Across all 10 repos, 111 of the 112 labeled declarations can't prove which PHP build runs: floating tags, setup-php, distro packages, Sail runtimes, bundled images, templated tags and composer constraints. The one exception is a `.tool-versions` file with a patch version. Against php.net's fix table, a naive version compare gives a firm "vulnerable" or "fixed" on all 95 version-dependent, non-EOL findings whose source can't prove the runtime. Each of those is a guess.

It's a small corpus with one labeling pass. Every run is in [`results/runs/`](https://github.com/Amsozzer1/php2shell-repo-audit/blob/main/results/runs/README.md), with the method in [`results/numbers.md`](https://github.com/Amsozzer1/php2shell-repo-audit/blob/main/results/numbers.md).

## The tool

[php2shell-repo-audit](https://github.com/Amsozzer1/php2shell-repo-audit) reads those files and puts each declaration in ACTION REQUIRED, CHECK MANUALLY or DECLARED ≥ FIXED, with a reason. It never calls a repo fine: DECLARED ≥ FIXED always means "runtime not verified". It needs Node 20 or newer and has no runtime dependencies.

```sh
npx php2shell-repo-audit@0.1.0 path/to/repo
npx php2shell-repo-audit@0.1.0 --org your-org --markdown > php2shell.md
```

`--org` reads default branches with a token from `GH_TOKEN`, `GITHUB_TOKEN` or `gh auth token`, GET requests only, and skips archived repos and forks. It only sees what the token can read, so check the repo count it prints.

Here's the published 0.1.0 on the demo repo, which is synthetic: a made-up repo with 7 planted declarations.

```text
$ npx php2shell-repo-audit@0.1.0 demo-repo
php2shell-repo-audit 0.1.0  ·  fix table rev 2: published 2026-10-21, https://www.php.net/archive/2026.php#2026-10-21-5 (remote)
Reads PHP versions declared in this repo. It does not check running servers.

ACTION REQUIRED (3)
  .tool-versions:2             dev   php 8.4.20                  vulnerable: fixed in 8.4.27, upgrade
  docker/api/Dockerfile:1      prod  FROM php:8.3.30-fpm         vulnerable: fixed in 8.3.36, upgrade
  docker/legacy/Dockerfile:1   prod  FROM php:8.1-fpm            eol: no official php.net release for 8.1; upgrade, use your vendor's backport, or build from php.net's backport branch PHP-8.1-CVE-2026-109618-109619

CHECK MANUALLY (4)
  .github/workflows/ci.yml:10  ci    setup-php 8.3               floating-rebuild: setup-php installs the current or pre-installed 8.3 patch, not a pinned build
  Dockerfile:1                 prod  FROM php:8.3-fpm            floating-rebuild: rebuild with --pull and redeploy after the release, then confirm with the docker run check
  composer.json:6              prod  "php": "^8.2"               constraint-only: a composer constraint is not the runtime
  docker/worker/Dockerfile:3   prod  apt-get install php8.2-cli  distro-vendor: vendors backport fixes without changing the version; check your vendor's security tracker

DECLARED ≥ FIXED (0)

The docker run check: docker run --rm --entrypoint php <image> -r 'echo PHP_VERSION;'
exit 1: action required
```

grep finds 3 of those 7 lines. The two exact pins below the fix and the 8.1 image get a firm verdict. Everything the repo can't settle goes to CHECK MANUALLY with the thing to check.

As a GitHub Action:

```yaml
- uses: actions/checkout@v4
- uses: Amsozzer1/php2shell-repo-audit@v0.1.0
  with:
    path: .
    fail-on: manual # or "action" to fail only on ACTION REQUIRED
```

It writes the findings to the job summary. By default it fails on ACTION REQUIRED, on anything that needs a manual check, and when it finds no PHP at all. A green job means nothing this repo declares needs attention, and says nothing about the runtime.

## What it doesn't see

It reads git. That leaves out:

- Servers and shared hosting that aren't described in a repo: cPanel, Plesk, `.htaccess` PHP handlers.
- PaaS and managed runtimes such as Platform.sh, Upsun, Laravel Vapor, Bref, Forge and Heroku. The [README](https://github.com/Amsozzer1/php2shell-repo-audit#what-this-does-not-catch) has the full list.
- Helm and Kustomize templates, compose `extends:`, GitLab `include:`, and versions set in `.env` files.
- The image you actually deployed, and anything built outside the repo. That's what the `docker run` line is for.
- With `--org`, anything that isn't on a default branch. A service built from another branch or an old tag won't be in the list.

The next thing I'd build is an `inspect <image>` command that runs `php` inside an image and checks its distro packages, so CI can check the build instead of the file that describes it. Until that exists, the repo gives you the list of things to rebuild, and the `docker run` line is still the only step here that looks at a real build.
