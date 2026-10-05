#let resume = json("../src/data/resume.json")
#let basics = resume.basics
#let slug = sys.inputs.at("slug", default: "cv")

// LaTeX sets 10pt type on a 12pt baseline. Typst measures leading from the baseline to the next
// line's cap height, so the gap is 12pt minus the 6.83pt cap height of 10pt Computer Modern.
#let gap = 12pt - 6.83pt

#set document(title: basics.name + " Résumé", author: basics.name)
#set page(paper: "us-letter", margin: (left: 0.35in, right: 0.35in, top: 0.25in, bottom: 0.22in))
#set text(font: "New Computer Modern", size: 10pt, lang: "en", region: "US", hyphenate: false)
#set par(justify: true, leading: gap, spacing: gap)
#set list(indent: 0pt, body-indent: 5pt)

#show link: set text(fill: rgb(0, 0, 255))
#show title: set text(size: 14.4pt)
#show title: set block(below: gap + 3pt)
#show heading: set text(size: 10pt)
// Section spacing is what holds the résumé to a single page; at gap + 8pt the last two bullets spill.
#show heading: set block(
  above: gap + 5pt,
  below: 3.6pt,
  width: 100%,
  inset: (bottom: 3.4pt),
  stroke: (bottom: 0.4pt),
)

#let months = ("Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec")

#let month-year(date) = {
  let (year, ..rest) = date.split("-")
  if rest.len() == 0 { year } else { months.at(int(rest.first()) - 1) + " " + year }
}

#let dates(item) = {
  let end = item.at("endDate", default: none)
  month-year(item.startDate) + " – " + if end == none { "Present" } else { month-year(end) }
}

#let bare(url) = url.replace(regex("^https?://(www\.)?"), "")

// Text between backticks is code, like \texttt in the LaTeX version. JSON strings skip Typst's
// smart quotes, so apostrophes are curled here.
#let rich(value) = value.split("`").enumerate().map(((i, part)) => {
  if calc.odd(i) { raw(part) } else { part.replace("'", "’") }
}).join()

#let entry(title, place, subtitle, when) = [
  #strong(title) #h(1fr) #strong(place) \
  #emph(subtitle) #h(1fr) #emph(when)
]

#align(center)[
  #title(upper(basics.name))
  #(
    link("mailto:" + basics.email, basics.email),
    // Reads as the bare domain, but the click goes through a tracked slug, so a visit that
    // starts in the PDF can be told apart from one that starts in a link I sent. Pass
    // --input slug=<company> to give a single application its own.
    link(basics.url + "/r/" + slug, bare(basics.url)),
    ..basics.profiles.map(profile => link(profile.url, bare(profile.url))),
    basics.location.city + ", " + basics.location.region + " · " + basics.relocation,
  ).join(" | ")
]

// That -2.4pt was for when a ruled section heading came first and brought its own space above.
// The summary is a plain paragraph, so it needs its own air or it collides with the contact line.
#v(gap)

#basics.summary

#v(gap - 3pt)

= Experience
#for (i, job) in resume.work.enumerate() {
  if i > 0 { v(0.2em) }
  entry(job.name, job.location, job.position, dates(job))
  // One employer, several client systems, each with its own stack line. The system is named,
  // the client never is.
  if "tracks" in job {
    for track in job.tracks {
      v(0.15em)
      [#emph(track.name) · #track.stack]
      list(..track.highlights.map(rich))
    }
  } else {
    list(..job.highlights.map(rich))
  }
}

= Projects
#for (i, project) in resume.projects.enumerate() {
  if i > 0 { v(0.2em) }
  // The visible text is the path, not the word "Repo". Most ATS parsers keep the text and drop
  // the link, so a reader of the parsed version still gets somewhere.
  [#strong(project.name + ": " + project.description) · #link(project.url, bare(project.url))]
  // The LaTeX project lists use a wider 14pt left margin.
  list(indent: 4pt, ..project.highlights.map(rich))
}

= Skills
#resume.skills.map(skill => [#strong(skill.name + ":") #skill.keywords.join(", ")]).join(linebreak())

= Education
// entry() is inline, so two schools in a row would run together on one line. Each gets its
// own block.
#for (i, school) in resume.education.enumerate() {
  if i > 0 { v(0.2em) }
  let study = school.at("abbreviation", default: school.studyType) + " in " + school.area
  let honors = school.at("score", default: none)
  if honors != none { study += ", " + honors }
  let notes = school.at("courses", default: ())
  if notes.len() > 0 { study += " · " + notes.join(", ") }
  let when = school.at("endDate", default: none)
  block(entry(school.institution, none, study, if when == none { "" } else { month-year(when) }))
}

= Publications & Presentations
// One sentence. All three citations stay in resume.json and are served at /resume.json.
#list([#rich(resume.publications.at(0).summary)])
