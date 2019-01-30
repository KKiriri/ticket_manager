module.exports = {
  Addedlablename: 'stale',
  //only use a new label!
  DaysuntilAdd: 3,
  DaysUntilClose: 1,
  perform: !process.env.DRY_RUN,
  TargetLabel:[],
  //delete TargetLabel to empty list if no target label
  TargetMilestone:[],
  //delete TargetMilestone to empty list if no target label
  Squardgroup:[],
  closeComment:
    'This issue has been automatically closed by bot'
}
