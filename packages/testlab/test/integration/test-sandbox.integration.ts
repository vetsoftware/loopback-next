// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/testlab
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {TestSandbox, expect} from '../..';
import {resolve} from 'path';
import {createHash} from 'crypto';
import * as util from 'util';
import {remove, pathExists, readFile} from 'fs-extra';

describe('TestSandbox integration tests', () => {
  let sandbox: TestSandbox;
  let path: string;
  const COPY_FILE = 'copy-me.txt';
  const COPY_FILE_PATH = resolve(
    __dirname,
    '../../../test/fixtures',
    COPY_FILE,
  );
  const TEST_FILE = 'test.js';
  const TEST_FILE_RESOLVED = resolve(__dirname, '../fixtures', TEST_FILE);
  const TEST_FILE_MAP = 'test.js.map';
  const TEST_FILE_MAP_RESOLVED = resolve(
    __dirname,
    '../fixtures',
    TEST_FILE_MAP,
  );

  let fileContent: string;

  beforeEach(createSandbox);
  beforeEach(givenPath);
  afterEach(deleteSandbox);

  it('returns path of sandbox and it exists', async () => {
    expect(path).to.be.a.String();
    expect(await pathExists(path)).to.be.True();
  });

  it('creates a directory in the sandbox', async () => {
    const dir = 'controllers';
    await sandbox.mkdir(dir);
    expect(await pathExists(resolve(path, dir))).to.be.True();
  });

  it('copies a file to the sandbox', async () => {
    await sandbox.copyFile(COPY_FILE_PATH);
    expect(await pathExists(resolve(path, COPY_FILE))).to.be.True();
    await compareFiles(COPY_FILE_PATH, resolve(path, COPY_FILE));
  });

  it('copies and renames the file to the sandbox', async () => {
    const rename = 'copy.me.js';
    await sandbox.copyFile(COPY_FILE_PATH, rename);
    expect(await pathExists(resolve(path, COPY_FILE))).to.be.False();
    expect(await pathExists(resolve(path, rename))).to.be.True();
    await compareFiles(COPY_FILE_PATH, resolve(path, rename));
  });

  it('copies file to a directory', async () => {
    const dir = 'test';
    const rename = `${dir}/${COPY_FILE}`;
    await sandbox.copyFile(COPY_FILE_PATH, rename);
    expect(await pathExists(resolve(path, rename))).to.be.True();
    await compareFiles(COPY_FILE_PATH, resolve(path, rename));
  });

  it('copies source file and map to directory', async () => {
    await sandbox.copySourceCodeFile(TEST_FILE_RESOLVED);
    expect(await pathExists(resolve(path, TEST_FILE))).to.be.True();
    expect(await pathExists(resolve(path, TEST_FILE_MAP))).to.be.True();
    await compareFiles(TEST_FILE_RESOLVED, resolve(path, TEST_FILE));
    await compareFiles(TEST_FILE_MAP_RESOLVED, resolve(path, TEST_FILE_MAP));
  });

  it('copies source file and map to sub-directory (without file name)', async () => {
    const subdir = 'test';
    await sandbox.copySourceCodeFile(TEST_FILE_RESOLVED, subdir);
    expect(await pathExists(resolve(path, 'test/test.js'))).to.be.True();
    expect(await pathExists(resolve(path, 'test/test.js.map'))).to.be.True();
    await compareFiles(TEST_FILE_RESOLVED, resolve(path, 'test/test.js'));
    await compareFiles(
      TEST_FILE_MAP_RESOLVED,
      resolve(path, 'test/test.js.map'),
    );
  });

  it('copies source file (renamed) and map file (with new name)', async () => {
    const rename = 'test.rename.js';
    await sandbox.copySourceCodeFile(TEST_FILE_RESOLVED, rename);
    expect(await pathExists(resolve(path, rename))).to.be.True();
    expect(await pathExists(resolve(path, rename + '.map'))).to.be.True();
    await compareFiles(TEST_FILE_RESOLVED, resolve(path, rename));
    await compareFiles(TEST_FILE_MAP_RESOLVED, resolve(path, rename + '.map'));
  });

  it('ignores the map file if copyMap is set to false', async () => {
    await sandbox.copySourceCodeFile(TEST_FILE_RESOLVED, TEST_FILE, false);
    expect(await pathExists(resolve(path, TEST_FILE))).to.be.True();
    expect(await pathExists(resolve(path, TEST_FILE_MAP))).to.be.False();
    await compareFiles(TEST_FILE_RESOLVED, resolve(path, TEST_FILE));
  });

  it('deletes the test sandbox', async () => {
    await sandbox.delete();
    expect(await pathExists(path)).to.be.False();
  });

  describe('after deleting sandbox', () => {
    const ERR: string =
      'TestSandbox instance was deleted. Create a new instance.';

    beforeEach(callSandboxDelete);

    it('throws an error when trying to call getPath()', () => {
      expect(() => sandbox.getPath()).to.throw(ERR);
    });

    it('throws an error when trying to call mkdir()', async () => {
      await expect(sandbox.mkdir('test')).to.be.rejectedWith(ERR);
    });

    it('throws an error when trying to call copy()', async () => {
      await expect(sandbox.copyFile(COPY_FILE_PATH)).to.be.rejectedWith(ERR);
    });

    it('throws an error when trying to call reset()', async () => {
      await expect(sandbox.reset()).to.be.rejectedWith(ERR);
    });

    it('throws an error when trying to call delete() again', async () => {
      await expect(sandbox.delete()).to.be.rejectedWith(ERR);
    });
  });

  async function callSandboxDelete() {
    await sandbox.delete();
  }

  async function compareFiles(original: string, copied: string) {
    const originalContent = await readFile(original, 'utf8');
    const copiedContent = await readFile(copied, 'utf8');
    expect(copiedContent).to.equal(originalContent);
  }

  function createSandbox() {
    sandbox = new TestSandbox(resolve(__dirname, '../../.sandbox'));
  }

  function givenPath() {
    path = sandbox.getPath();
  }

  async function deleteSandbox() {
    if (!await pathExists(path)) return;
    await remove(sandbox.getPath());
  }
});
