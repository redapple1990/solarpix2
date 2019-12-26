import { schema } from 'normalizr';
//Root category defined at bottom, after deepest object defined first.

//Define a categories schema
const pictureReq = new schema.Entity('pictureReqs');

//Define a job schema
const job = new schema.Entity('jobs', {
  pictureReqs: pictureReq
});

//Define a job array

export { job };
//const normalizedData = normalize(localStorage.state, job);
