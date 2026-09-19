DOCKER ?= docker run --rm -v "$(PWD)":/work -w /work texlive/texlive:latest-full
LATEXMK = $(DOCKER) latexmk -xelatex -outdir=build

.PHONY: pdf open clean

pdf:
	$(LATEXMK) -interaction=nonstopmode -halt-on-error resume.tex

open: pdf
	open build/resume.pdf
	$(LATEXMK) -c resume.tex

clean:
	rm -rf build