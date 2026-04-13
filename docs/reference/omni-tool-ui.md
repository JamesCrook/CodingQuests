# OmniTool UI

CSS-refactor tool, Include path tool and Scatter-Gather tool are three tools that  work with your local files. You drag a file tree onto the drop zone for files, and can then perform global actions across the files. You need to be using Google Chrome browser, not Safari.

---
## CSS Refactor Tool UI

This UI works in Chromium browser.

Drag a file tree to the drop zone. The UI finds html files, javascript files and css files, and tracks the css usage in them.

You can sort and filter the reported classes.

### Promote Colors

Colors are converted to symbolic names, such as --color-ff8012.

You can now rename these colours in an editor (using search and replace) to give them meaningful names as to their function. The promotion to variables makes these colours dynamically configuragble via a css rule. The colors are set up in :root. You can change the variables in css for different theming by a [data] override, in particular for switching dark and light mode.

### Apply Renames

You can queue up a number of class renamings, and have the UI make the changes. This will change both declarations and usages.

---
## Include Path Tool UI

Use the fix button to automatically fix the paths of all include files that do not connect to anything.

---
## Scatter Gather Tool UI

Use a pattern such as 'Overview' to gather all Overview sections from all .md docs into one file you designate. Make edits in that file, then scatter, to send the edited text back to the source docs.

The main use of this is to create consistency across files, for example if you want the same kinds of overview information in all docs which have an overview section.
