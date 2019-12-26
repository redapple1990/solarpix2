import React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { updateCatUploadStatus } from '../actions';

import uploadImage from '../apis/uploadImage';
import db from '../database/db';

import { withToastManager } from 'react-toast-notifications';

const uploadAllPhotos = (props) => {
  console.log('uploadAllPhotos');
};


export default compose(
  connect(null))
(uploadAllPhotos);
