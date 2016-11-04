'use strict';

const expect = require('chai').expect;

// Error.js and Service.js require each other. Force a fresh load of both
// modules with Error.js first (the load order that exposes the problem) to
// make sure the circular dependency does not break either module.
delete require.cache[require.resolve('./Error')];
delete require.cache[require.resolve('./Service')];

const ErrorModule = require('./Error');
const Service = require('./Service');

describe('Error', () => {
  describe('#constructor()', () => {
    it('should create an instance of ServerlessError', () => {
      const errorInstance = new ErrorModule.SError('A message');
      expect(errorInstance).to.be.instanceof(Error);
      expect(errorInstance.name).to.equal('ServerlessError');
      expect(errorInstance.message).to.equal('A message');
    });
  });

  describe('#logError()', () => {
    it('should be a function', () => {
      expect(ErrorModule.logError).to.be.a('function');
    });
  });

  describe('Service loaded after Error', () => {
    it('should still throw a ServerlessError when a function does not exist', () => {
      const serviceInstance = new Service();
      let thrown;
      try {
        serviceInstance.getFunction('doesNotExist');
      } catch (e) {
        thrown = e;
      }
      expect(thrown).to.be.instanceof(Error);
      expect(thrown.name).to.equal('ServerlessError');
      expect(thrown.message).to.include('doesNotExist');
    });
  });
});
