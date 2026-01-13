# Getting Started

This is a placeholder file. Don't believe it (yet)

This is a condensed versions of how to get started; a longer version will later be available at /docs/tutorials/getting-started.md

## 1. Prerequisites
*   macOS (for Metal acceleration)
*   Python 3.8+
*   C++ Compiler (Clang/GCC) with C++17 support

## 1a. Apple Metal (Required for speed)
For accelerated Smith-Waterman searches on Apple Silicon (M1/M2/M3/M4):
*   **Xcode Command Line Tools:** Ensure `clang` and `xcrun` are available.
*   **metal-cpp:** The project expects the `metal-cpp` headers to be located at `$HOME/metal-cpp` or METAL_CPP_PATH to be defined. You can download the headers from the [Apple Developer website](https://developer.apple.com/metal/cpp/).

## 2. Installation
1.  Clone the repository.
2.  Install dependencies:
    ```bash
    pip install -e .
    ```
    (Dependencies are managed via `pyproject.toml`)

3.  Copy .env.example to .env and customise it for where you want/expect files
    See the comments in the file for what the paths are for.

4.  Compile the C++/Metal components:
    ```bash
    ./compile.sh
    ```
    *Note: This requires `metal-cpp` to be available, see prerequisites 1a*

5.  Install the LEAN mathlib dataset
    ```bash
    ./get_mathlib.sh
    ```

## 3. Running Tools via CLI

MathsQuests is built on top of command line tools. See /docs/tutorials/cli for more details.

# Ready to Rock Script

The script py/ready_to_rock.py attempts to automate these steps. It runs through a checklist of steps, and if one fails, reports on the failure with what (it believes) needs doing to fix it.

Here is a sample of what it may output.

```
============================================================
  🎸 Ready to Rock? - Environment Checker
============================================================


  [ENVIRONMENT]
  ✅ Python Version: Python 3.9.6
  ✅ Apple Silicon: Apple M4 Pro

  [CONFIGURATION]
  ✅ .env File: .env configured

  [DEPENDENCIES]
  ✅ metal-cpp: Found at /Users/james/metal-cpp
  ✅ Package Installed: Package installed (seqquests.egg-info)

  [COMPILATION]
  ✅ Metal Components: Found all binaries (THREADS=65536, UNROLL=40)
  ✅ WASM Components: Found sw_align_module.js (7.9 KB)

------------------------------------------------------------
  🎸 You're ready to rock! All checks passed.
------------------------------------------------------------
```

At this point, with all checks green, you can run the search.
```bash
python py/sw_search.py
```
See the 'Running the Server' section for details/alternatives. When it has completed the 'ready_to_rock.py' script, if run, will report additional steps:

```
============================================================
  📊 Post-Processing Checks (search job completed)
============================================================

  [RESULTS]
  ✅ ...
------------------------------------------------------------
  🔬 Analysis complete! Results ready for review in the web UI.
------------------------------------------------------------
```

# Docs

There is more documentation in the [docs](./docs) folder, though as of Jan 2026 these docs and the additional software they describe are very much a work in progress.