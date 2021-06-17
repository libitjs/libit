import * as path from 'path';
import SG from 'strong-globalize';

SG.SetRootDir(path.join(__dirname, '..'), {autonomousMsgLoading: 'all'});
SG.SetDefaultLanguage();
