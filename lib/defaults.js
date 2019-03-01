module.exports = {
  Addedlablename: 'stale',
  //only use a new label!
  DaysuntilAdd: 3,
  DaysUntilClose: 1,
  perform: !process.env.DRY_RUN,
  TargetLabel:[],
  ExcludeLabel:[],
  //delete TargetLabel to empty list if no target label
  ExcludeMilestones:[],
  //delete ExcludeMilestones to empty list if no target label
  Squadgroup:["api"],
  tagComment:
    'Add tag due to inactivity',
  closeComment:
    'This issue has been automatically closed by bot'
}
