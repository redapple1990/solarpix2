export default (state = {}, action) => {
  switch (action.type) {
    case 'CREATE_JOB':
      return action.payload;
    default:
      return state;
  }
};
