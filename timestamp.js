/* eslint
  strict: ["error", "global"],
  import/no-unresolved: 0,
  no-underscore-dangle: ["error", { "allow": ["_id"] }]
*/
/* global $H, self, postMessage */

'use strict';

const name = 'timestamp';
let Lanes;
let Harbors;
let Shipments;

const dependencies = ['tiny-worker', 'debug'].join(' ');

require('child_process').execSync(`npm i ${dependencies}`);

const log = require('debug')(`${name}:log`);

log('Dependencies installed:', dependencies);

const Worker = require('tiny-worker');

const worker = new Worker(() => {
  self.onmessage = function handleMessage(evt) {
    const data = evt.data;
    data.timestamp = Date.now();
    data.exitCode = 0;

    postMessage(data);
  };
});

worker.onmessage = $H.bindEnvironment((evt) => {
  const exitCode = evt.data.exitCode === 0 ?
    evt.data.exitCode :
    (evt.data.exitCode || 1)
  ;
  const manifest = evt.data.manifest;
  const lane = Lanes.findOne(evt.data.lane);
  const shipment = Shipments.findOne(evt.data.shipment);
  shipment.stdout.push(evt.data.timestamp);

  Shipments.update(shipment._id, shipment);

  $H.call('Lanes#end_shipment', lane, exitCode, manifest);
});

const renderDescription = () => (`
  <p>This harbor records a timestamp for when it is called.</p>
  <p>It also assigns any prior manifest as its own records.</p>
  <p>Finally, it does this via a queue, releasing the call stack.</p>
`);

const register = (lanes, users, harbors, shipments) => {
  Lanes = lanes;
  Harbors = harbors;
  Shipments = shipments;

  return name;
};

const update = (lane, values) => {
  return true;
};

const work = (lane, manifest) => {
  const shipment = Shipments.findOne({
    lane: lane._id,
    start: manifest.shipment_start_date,
  });

  worker.postMessage({
    lane: lane._id,
    shipment: shipment._id,
    manifest,
  });

  return manifest;
};

module.exports = {
  render_input: renderDescription,
  render_work_preview: renderDescription,
  register,
  update,
  work,
};

