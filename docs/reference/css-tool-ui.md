# CSS Refactor Tool UI

This UI works in Chromium browser.

Drag a file tree to the drop zone. The UI finds html files, javascript files and css files, and tracks the css usage in them.

You can sort and filter the reported classes.

----

## Promote Colors

Colors are converted to symbolic names, such as --color-ff8012.

You can now rename these colours in an editor (using search and replace) to give them meaningful names as to their function. The promotion to variables makes these colours dynamically configuragble via a css rule. The colors are set up in :root. You can change the variables in css for different theming by a [data] override, in particular for switching dark and light mode.

## Apply Renames

You can queue up a number of class renamings, and have the UI make the changes. This will change both declarations and usages.

