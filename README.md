# `cdda-diary-viewer`

Quick and dirty [diary](https://www.reddit.com/r/cataclysmdda/comments/reuoxh/diaries_are_a_thing_now/) visualizer for [Cataclysm: Dark Days Ahead](https://cataclysmdda.org/).

A quick, basic example: <https://abesto.github.io/cdda-diary-viewer/?diary-url=https%3A%2F%2Fgist.githubusercontent.com%2Fabesto%2Fc095632ee20e77054c9f757464de6b00%2Fraw%2F12cfc5766d206131ef0f466ef5d1e2a3becbd055%2Fgistfile1.txt#0>

## How do I use this?

* Record diary pages in-game as usual
* Either manually export the diary (and find it next to your saved games: `WORLDNAME/CHARACTERNAME_diary.txt`), or find the diary of dead characters in the `memorials` folder
* Upload the diary contents to a GitHub Gist at <https://gist.github.com/>. This will give you something like <https://gist.github.com/abesto/c095632ee20e77054c9f757464de6b00>
* Now click the Raw button on the top right of the file display. This will give you something like <https://gist.githubusercontent.com/abesto/c095632ee20e77054c9f757464de6b00/raw/12cfc5766d206131ef0f466ef5d1e2a3becbd055/gistfile1.txt>
* Open <https://abesto.github.io/cdda-diary-viewer/> and paste the URL you got above into the input at the top of the page, then click "Load"

That's it! You can now explore your diary on the web, and share the link now sitting in your browser's URL bar with anyone. The URL also includes the currently opened diary entry, so you can link to a specific entry as well.

## Features

Beyond the obvious:

* Text you enter yourself in the diary is rendered as Markdown, including GitHub flavored task-lists being turned into checkboxes (so `- [ ] I need a thing` and `- [x] I did a thing`)
* You can navigate between entries with the up/down arrows and the j/k Vim keys

## How Does It Work?

* It's extremely bare-bones: plain hand-rolled JS and CSS, not even an ESLint config. This is mostly because it's simple enough to allow doing this, and so this was the quickest way to implement the MVP.
* It fetches the passed in URL from the client side in the browser. This means any URL will work, as long as its security settings accept requests from the site this tool is hosted at.
* It parses the diary using a ton of heuristics. It's probably good enough in most cases? A better alternative would be consuming a structured export of diaries, which unfortunately doesn't currently exist.
* The in-game diary viewer shows a bunch of colors that we can't reproduce without more detailed parsing and reading game (i.e. "what color is a zombie"). A better alternative would be if a hypothetical structured diary export included color information.

## Contributing

* Report issues at <https://github.com/abesto/cdda-diary-viewer/issues>
* Send pull requests to <https://github.com/abesto/cdda-diary-viewer>!