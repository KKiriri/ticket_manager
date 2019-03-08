module.exports = {
  Addedlablename: 'stale',
  //only use a new label!
  DaysuntilAdd: 90,
  DaysUntilClose: 30,
  perform: !process.env.DRY_RUN,
  TargetLabel:[`not_exist`],
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
