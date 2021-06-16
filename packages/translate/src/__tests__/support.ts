import path from 'path';

export function getFixturePath(...segments: string[]) {
  return path.join(__dirname, '..', '..', 'fixtures', ...segments);
}
