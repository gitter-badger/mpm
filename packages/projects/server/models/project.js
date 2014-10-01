'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;


/**
 * Project Schema
 */
var ProjectSchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  name: {
    first: {
      type: String,
      required: true,
      trim: true
    },
    last:{
      type:String,
      required: true,
      trim: true
    }
  },
  department: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true
  },
  costCenter: {
    type: String,
    required: true,
    trim: true
  },
  additionalInfo: {
    type: String,
    required: false,
    trim: true
  },
  shipping: {
    type: String,
    required: true,
    trim: true
  },
  attention: {
    type: String,
    required: true,
    trim: true
  },
  address1: {
    type: String,
    required: false,
    trim: true
  },
  address2: {
    type: String,
    required: false,
    trim: true
  },
  city: {
    type: String,
    required: false,
    trim: true
  },
  State: {
    type: String,
    required: false,
    trim: true
  },
  zip: {
    type: String,
    required: false,
    trim: true
  },
  country: {
    type: String,
    required: false,
    trim: true
  },
  requestType: {
    type: String,
    required: true,
    trim: true
  },
  projectName: {
    type: String,
    required: true,
    trim: true
  },
  projectDetails: {
    type: String,
    required: true,
    trim: true
  },
  projectAudience: {
    type: String,
    required: false,
    trim: true
  },
  projectMessage: {
    type: String,
    required: false,
    trim: true
  },
  completionDate: {
    type: String,
    required: true,
    trim: true
  },
  departmentHeadApproving: {
    type: String,
    required: true,
    trim: true
  },
  progress: {
    type: Number,
    default: 0
  },
  notifications: [{
    text: String,
    userId: String,
    userName: String,
    status: String
  }],
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  }
});

/**
 * Validations
 */
ProjectSchema.path('name.first').validate(function(first) {
  return !!first;
}, 'First name cannot be blank');

ProjectSchema.path('name.last').validate(function(last) {
  return !!last;
}, 'Last name cannot be blank');

ProjectSchema.path('department').validate(function(department) {
  return !!department;
}, 'Department cannot be blank');

ProjectSchema.path('email').validate(function(email) {
  return !!email;
}, 'Email cannot be blank');

ProjectSchema.path('costCenter').validate(function(costCenter) {
  return !!costCenter;
}, 'Cost center cannot be blank');

ProjectSchema.path('shipping').validate(function(shipping) {
  return !!shipping;
}, 'Shipping option cannot be blank');

ProjectSchema.path('attention').validate(function(attention) {
  return !!attention;
}, 'Attention cannot be blank');

ProjectSchema.path('requestType').validate(function(requestType) {
  return !!requestType;
}, 'Request type cannot be blank');

ProjectSchema.path('projectName').validate(function(projectName) {
  return !!projectName;
}, 'Project name cannot be blank');

ProjectSchema.path('projectDetails').validate(function(projectDetails) {
  return !!projectDetails;
}, 'Project details cannot be blank');

ProjectSchema.path('completionDate').validate(function(completionDate) {
  return !!completionDate;
}, 'Completion date cannot be blank');

ProjectSchema.path('departmentHeadApproving').validate(function(departmentHeadApproving) {
  return !!departmentHeadApproving;
}, 'Department head approving this request cannot be blank');


/**
 * Statics
 */
ProjectSchema.statics.load = function(id, cb) {
  this.findOne({
    _id: id
  }).populate('user', 'name username').exec(cb);
};

mongoose.model('Project', ProjectSchema);
