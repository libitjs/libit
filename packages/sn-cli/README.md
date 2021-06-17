# @libit/sn-cli

> The sn command line tool

## Installation

```bash
npm i @libit/sn-cli -g
```

## Usage

`@libit/sn-cli` provide `lsn` command and `serum` as alternative command

```bash
  lsn x.x.x — Retrieve the serial number of the local machine

  USAGE
    ▸ sernum  [OPTIONS...]

  OPTIONS

    -c, --cwd <cwd>                      The custom current working directory
    -f, --file <file>                    The custom cache file name
    -d, --hash                           Retrieve the hashed serial number
    -p, --prefix <prefix>                A string to be prefixed ahead of the shell command to
                                         be run
    -s, --size <size>                    Slice the serial number to specified size
    -u, --uuid                           Prefer to retrieve uuid on the first attempt

  GLOBAL OPTIONS

    -h, --help                           Display global help or command-related help.
    -V, --version                        Display version.
    --no-color                           Disable use of colors in output.
    -v, --verbose                        Verbose mode: will also output debug messages.
    --quiet                              Quiet mode - only displays warn and error messages.
    --silent                             Silent mode: does not output anything, giving no
                                         indication of success or failure other than the exit
                                         code.
```

## Example

```bash
> lsn
Q09XL3KBMGH0
```

```bash
> sernum
Q09XL3KBMGH0
```
