import {digest} from '../../sn';

export interface SerialValue {
  output: string;
  result: string;
  hash: string;
}

export const samples: Record<
  string,
  {
    output: string;
    serial: SerialValue;
    uuid?: SerialValue;
    [k: string]: any;
  }
> = {
  darwin: {
    output: `
Hardware:

    Hardware Overview:

      Model Name: MacBook Pro
      Model Identifier: MacBookPro15,1
      Processor Name: 6-Core Intel Core i9
      Processor Speed: 2.9 GHz
      Number of Processors: 1
      Total Number of Cores: 6
      L2 Cache (per Core): 256 KB
      L3 Cache: 12 MB
      Hyper-Threading Technology: Enabled
      Memory: 32 GB
      Boot ROM Version: 1037.147.1.0.0 (iBridge: 17.16.16065.0.0,0)
      Serial Number (system): C01XK9JBJGH7
      Hardware UUID: 16827C8B-E532-5BF1-A9D8-4B200C5500CB
      Activation Lock Status: Disabled
`,
    serial: {
      output: '      Serial Number (system): C01XK9JBJGH7',
      result: 'C01XK9JBJGH7',
      hash: digest('C01XK9JBJGH7'),
    },
    uuid: {
      output: '      Hardware UUID: 16827C8B-E532-5BF1-A9D8-4B200C5500CB',
      result: '16827C8B-E532-5BF1-A9D8-4B200C5500CB',
      hash: digest('16827C8B-E532-5BF1-A9D8-4B200C5500CB'),
    },
  },
  linux_arm: {
    output: `
processor\t: 0
model name\t: ARMv7 Processor rev 3 (v7l)
BogoMIPS\t: 108.00
Features\t: half thumb fastmult vfp edsp neon vfpv3 tls vfpv4 idiva idivt vfpd32 lpae evtstrm crc32
CPU implementer\t: 0x41
CPU architecture: 7
CPU variant\t: 0x0
CPU part\t: 0xd08
CPU revision\t: 3

processor\t: 1
model name\t: ARMv7 Processor rev 3 (v7l)
BogoMIPS\t: 108.00
Features\t: half thumb fastmult vfp edsp neon vfpv3 tls vfpv4 idiva idivt vfpd32 lpae evtstrm crc32
CPU implementer\t: 0x41
CPU architecture: 7
CPU variant\t: 0x0
CPU part\t: 0xd08
CPU revision\t: 3

processor\t: 2
model name\t: ARMv7 Processor rev 3 (v7l)
BogoMIPS\t: 108.00
Features\t: half thumb fastmult vfp edsp neon vfpv3 tls vfpv4 idiva idivt vfpd32 lpae evtstrm crc32
CPU implementer\t: 0x41
CPU architecture: 7
CPU variant\t: 0x0
CPU part\t: 0xd08
CPU revision\t: 3

processor\t: 3
model name\t: ARMv7 Processor rev 3 (v7l)
BogoMIPS\t: 108.00
Features\t: half thumb fastmult vfp edsp neon vfpv3 tls vfpv4 idiva idivt vfpd32 lpae evtstrm crc32
CPU implementer\t: 0x41
CPU architecture: 7
CPU variant\t: 0x0
CPU part\t: 0xd08
CPU revision\t: 3

Hardware\t: BCM2835
Revision\t: c03111
Serial\t\t: 100000003d7459c3
Model\t\t: Raspberry Pi 4 Model B Rev 1.1
`,
    serial: {
      output: 'Serial\t\t: 100000003d7459c3',
      result: '100000003d7459c3',
      hash: digest('100000003d7459c3'),
    },
  },
  linux: {
    output: `
Getting SMBIOS data from sysfs.
SMBIOS 3.1.1 present.

Handle 0x0001, DMI type 1, 27 bytes
System Information
\tManufacturer: To Be Filled By O.E.M.
\tProduct Name: To Be Filled By O.E.M.
\tVersion: To Be Filled By O.E.M.
\tSerial Number: To Be Filled By O.E.M.
\tUUID: A4C28570-A0E9-0000-0000-000000000000
\tWake-up Type: Power Switch
\tSKU Number: To Be Filled By O.E.M.
\tFamily: To Be Filled By O.E.M.

Handle 0x0008, DMI type 32, 20 bytes
System Boot Information
\tStatus: No errors detected

`,
    serial: {
      output: '\tSerial Number: To Be Filled By O.E.M.',
      result: 'A4C28570-A0E9-0000-0000-000000000000',
      hash: digest('A4C28570-A0E9-0000-0000-000000000000'),
    },
    uuid: {
      output: '\tUUID: A4C28570-A0E9-0000-0000-000000000000',
      result: 'A4C28570-A0E9-0000-0000-000000000000',
      hash: digest('A4C28570-A0E9-0000-0000-000000000000'),
    },
  },
  freebsd: {
    output: `
Getting SMBIOS data from sysfs.
SMBIOS 3.1.1 present.

Handle 0x0001, DMI type 1, 27 bytes
System Information
\tManufacturer: To Be Filled By O.E.M.
\tProduct Name: To Be Filled By O.E.M.
\tVersion: To Be Filled By O.E.M.
\tSerial Number: To Be Filled By O.E.M.
\tUUID: A4C28570-A0E9-0000-0000-000000000000
\tWake-up Type: Power Switch
\tSKU Number: To Be Filled By O.E.M.
\tFamily: To Be Filled By O.E.M.

Handle 0x0008, DMI type 32, 20 bytes
System Boot Information
\tStatus: No errors detected

`,
    serial: {
      output: '\tSerial Number: To Be Filled By O.E.M.',
      result: 'A4C28570-A0E9-0000-0000-000000000000',
      hash: digest('A4C28570-A0E9-0000-0000-000000000000'),
    },
    uuid: {
      output: '\tUUID: A4C28570-A0E9-0000-0000-000000000000',
      result: 'A4C28570-A0E9-0000-0000-000000000000',
      hash: digest('A4C28570-A0E9-0000-0000-000000000000'),
    },
  },
  win32: {
    output: `
IdentifyingNumber
Parallels-15 81 7C 8B E5 52 5B F1 A9 D9 4B 60 0C 57 00 CB


`,
    serial: {
      output: `
IdentifyingNumber
Parallels-15 81 7C 8B E5 52 5B F1 A9 D9 4B 60 0C 57 00 CB

`,
      result: 'Parallels-15 81 7C 8B E5 52 5B F1 A9 D9 4B 60 0C 57 00 CB',
      hash: digest('Parallels-15 81 7C 8B E5 52 5B F1 A9 D9 4B 60 0C 57 00 CB'),
    },
  },
};
