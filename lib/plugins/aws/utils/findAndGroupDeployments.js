'use strict';

const _ = require('lodash');
const getS3ObjectsFromStacks = require('./getS3ObjectsFromStacks');

// Pre-compute the empty result once by reusing the sibling helper
const emptyResult = getS3ObjectsFromStacks([], '', '');

module.exports = (s3Response, service, stage) => {
  if (s3Response.Contents.length) {
    const regex = new RegExp(`serverless/${service}/${stage}/(.+-.+-.+-.+)/(.+)`);
    const s3Objects = s3Response.Contents.filter((s3Object) => s3Object.Key.match(regex));
    const names = s3Objects.map((s3Object) => {
      const match = s3Object.Key.match(regex);
      return {
        directory: match[1],
        file: match[2],
      };
    });
    const grouped = _.groupBy(names, 'directory');
    return _.map(grouped, (value) => value);
  }
  return emptyResult;
};
