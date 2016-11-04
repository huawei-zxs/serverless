'use strict';

const expect = require('chai').expect;
const semver = require('semver');
const pkg = require('../package.json');
const shrinkwrap = require('../npm-shrinkwrap.json');

// npm-shrinkwrap.json may use either the legacy (dependencies) or the
// lockfile v2 (packages) layout depending on the npm version used to
// generate it.
const getLockedVersion = (name) => {
  if (shrinkwrap.dependencies) {
    return shrinkwrap.dependencies[name] && shrinkwrap.dependencies[name].version;
  }
  const entry = shrinkwrap.packages[`node_modules/${name}`];
  return entry && entry.version;
};

describe('Dependency versions', () => {
  const deps = pkg.dependencies;

  Object.keys(deps).forEach((name) => {
    const range = deps[name];

    it(`installed version of ${name} satisfies the declared range ${range}`, () => {
      let installed;
      try {
        installed = require(`${name}/package.json`).version;
      } catch (e) {
        throw new Error(`could not resolve the installed version of ${name}: ${e.message}`);
      }

      expect(installed, `installed version of ${name}`).to.be.a('string');
      expect(semver.satisfies(installed, range),
        `${name}: installed version ${installed} does not satisfy the declared range ${range}`)
        .to.equal(true);
    });

    it(`locked version of ${name} satisfies the declared range ${range}`, () => {
      const locked = getLockedVersion(name);

      expect(locked, `${name} is missing from npm-shrinkwrap.json`).to.be.a('string');
      expect(semver.satisfies(locked, range),
        `${name}: locked version ${locked} does not satisfy the declared range ${range}`)
        .to.equal(true);
    });
  });

  it('installed lodash provides the APIs used by the codebase', () => {
    const lodash = require('lodash');

    // these APIs were introduced in lodash 4.x and do not exist in lodash 3.x
    expect(lodash.includes).to.be.a('function');
    expect(lodash.upperFirst).to.be.a('function');
  });
});
