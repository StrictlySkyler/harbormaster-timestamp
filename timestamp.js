/* eslint
  import/no-unresolved: 0,
  no-underscore-dangle: ["error", { "allow": ["_id"] }],
  global-require: 0,
  no-restricted-globals: 0,
*/
/* global $H, self, postMessage */

const name = 'timestamp';
const pkgs = ['tiny-worker'];
let Lanes;
let Shipments;

let Worker;
let worker;

const next = () => {
  Worker = require('tiny-worker');
  worker = new Worker(() => {
    self.onmessage = function handleMessage(evt) {
      const { data } = evt;
      data.timestamp = Date.now();
      data.exitCode = 0;

      postMessage(data);
    };
  });
  worker.onmessage = $H.bindEnvironment((evt) => {
    const exitCode = evt.data.exitCode === 0 ?
      evt.data.exitCode :
      (evt.data.exitCode || 1);
    const { manifest } = evt.data;
    const lane = Lanes.findOne(evt.data.lane);
    const shipment = Shipments.findOne(manifest.shipment_id);

    shipment.stdout.push(evt.data.timestamp);
    Shipments.update(shipment._id, shipment);

    $H.call('Lanes#end_shipment', lane, exitCode, manifest);
  });
};

const renderDescription = () => (`
  <p>This harbor records a timestamp for when it is called.</p>
  <p>It also assigns any prior manifest as its own records.</p>
  <p>Finally, it does this via a queue, releasing the call stack.</p>
`);

const register = (lanes, users, harbors, shipments) => {
  Lanes = lanes;
  Shipments = shipments;

  return { name, pkgs };
};

const update = () => true;

const work = (lane, manifest) => {
  worker.postMessage({
    lane: lane._id,
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
  next,
};

