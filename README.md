# CodingQuests

CodingQuests is a...

This README is a place holder.


## Current Status

Right now... the part of CodingQuests most likely of interest is the /findings/ folder. 

## Project Structure

```
/                            #
├─ c_src/                    # C++ and Metal source code
├─ data/                     # Small sample data files for development (not full data files)
├─ website/                  # HTML, CSS, JavaScript for the web interface
│  └─ 3sat.html              #  How computers solve 3Sat
├─ py/                       # Python scripts
│  ├─ ready_to_rock.py       #  Checks readiness; Sets up environment; Compiles code
│  └─ web_server.py          #  Web browser front end
├─ docs/                     # Docs (work in progress).
│  ├─ explanations/          #  Background rather than how to
│  ├─ how-to/                #  Recipes organised by related topics
│  ├─ reference/             #  Settings for the various scripts 
│  └─ tutorials/             #  Tutorial content
├─ GETTING_STARTED.md        # How to set up the system
├─ LICENSE.md                # Copyright licenses
├─ CITATION.cff              # Citing this work
└─ README.md                 # This README
```

C++/Objective-C provides accelerated versions of code that needs to be fast.

The web UI uses API-endpoints provided by a FastAPI web server. 

## Links for AI Assistants
Much of the code was created with AI assistance (Claude, Gemini, Jules). AI also helped with tracking down many cases where protein similarities were already known.

AI assistants are guided to instructions they should follow by text like the text below:

See [docs/reference/specs/specs.md](./docs/reference/specs/specs.md) for IMPORTANT REQUIREMENTS for AI assistant work.

## Getting started

See [GETTING_STARTED.md](./GETTING_STARTED.md) in this directory for instructions on getting started.

