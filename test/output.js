import path from 'path';
import test from 'ava';
import randomstring from 'randomstring';
import fs from 'fs-extra';
import uuid from 'uuid';
import cli from './helpers/cli';
import tmp from './helpers/tmp';
import read from './helpers/read';

test('--output works', async t => {
  const output = tmp('output.css');
  const {error, stderr} = await cli(['test/fixtures/a.css', 'test/fixtures/b.css', '-o', output]);

  t.ifError(error, stderr);
  t.is(await read(output), await read('test/fixtures/expected/ab.css'));
});

test('preserve order with large number of files', async t => {
  const outputDir = tmp();
  const outputFile = path.join(outputDir, uuid());
  const outputFilePromises = [];
  const filepaths = [];
  const expected = [];

  // eslint-disable-next-line no-magic-numbers
  for (let i = 0; i < 100; i++) {
    const filepath = path.join(outputDir, uuid());
    const content = randomstring.generate();

    filepaths.push(filepath);
    expected.push(content);
    outputFilePromises.push(fs.outputFile(filepath, content, {encoding: 'utf8'}));
  }
  await Promise.all(outputFilePromises);

  const {error, stderr} = await cli(filepaths.concat(['-o', outputFile]));

  t.ifError(error, stderr);
  t.is(expected.join('\n'), await read(outputFile));
});
