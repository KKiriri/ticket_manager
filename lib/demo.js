const scramjet = require('scramjet')
const fs = require('fs');
const axios=require ('axios')

module.exports = class icpbot{
  constructor (context, config, logger) {
    this.context = context//repository info
    this.github = context.github
    this.config = config//yml file's content
    this.logger = logger
    // this.remainingActions = 0
  }
//const {DaysuntilAdd, Addedlablename} = this.config
//read constant from yml file
  /**
   * requried parameters in the yaml file
    MaximumPerturn
    Addedlablename
    DaysuntilAdd
   */
// this.logger.info(this.config, `starting mark and sweep of ${type}`)

// main function
  async sweep () {
    this.issuesnum=[];
    //fs.truncate('output_test.txt', 0, function(){console.log('clear previous data')})
    this.logger.debug('Starting sweep')
    //const {MaximumPerturn} = this.config
    //this.remainingActions = MaximumPerturn
    const Labelissues =await this.getrequiredIssues()
    const Closeableissues = await this.getClosableIssues()
    //this.logger.info(Closeableissues)
    // print all issues
    // const {owner, repo} = this.context.repo()
    // var q=`repo:${owner}/${repo} is:issue is:open label:something`
    // const issues = await this.github.search.issues( {q, sort: 'updated', order: 'desc', per_page: 100})


    //Labelissues.forEach(issue => this.addlable(this.context.repo({number: issue.number})))
    // Closeableissues.forEach(issue => this.close(this.context.repo({number: issue.number})))

    if(this.issuesnum=== [] || this.issuesnum == 0){
      fs.appendFile('output_test.txt',` no target issue is found \n`
      , (err) => {
        // throws an error, you could also catch it here
        if (err) throw err;
        // success case, the file was saved
        this.logger.info('0 issue is found \n');
        }
      )
    }
    else{
    fs.appendFile('output_test.txt',`\n The issues got tagged are: ${this.issuesnum} ` + ' \n', (err) => {
      // throws an error, you could also catch it here
      if (err) throw err;
      // success case, the file was saved
      this.logger.info('output to file succesed \n');
      }
    )}
  }


  async getClosableIssues(){
    const {owner, repo} = this.context.repo()
    const {DaysUntilClose, Addedlablename} = this.config
    const labeledEarlierThan = this.since(DaysUntilClose)

    this.logger.info('will close issues updated earlier than '+ labeledEarlierThan)
    var q = `repo:${owner}/${repo} is:issue is:open  updated:<=${labeledEarlierThan} label:${Addedlablename} `
    const params = {q, sort: 'updated', order: 'desc', per_page: 100}
    const issues = await this.github.search.issues(params)
    this.logger.info('the total number of issues need to be close is '+issues.data.total_count)
    if (issues.data.total_count===0) {
      this.logger.info('no issue need to be closed')
    }
    else{
    }
    const neverRepliedArray = scramjet.fromArray(issues.data.items).filter(//issue =>
      //this.logger.info('issue need to be closed is #'+issue.number)
    ).toArray()
    return neverRepliedArray
  }

  async getrequiredIssues () {
    const {owner, repo} = this.context.repo()
    const {DaysuntilAdd,Squadgroup,TargetLabel,TargetMilestone,ExcludeLabel,Addedlablename} = this.config
    const UpdatedEarlierThan = this.since(DaysuntilAdd)
    this.logger.info('will add label to issues updated earlier than '+UpdatedEarlierThan)
    // find updated time is before certain amount of days, then check if updated_time is created_time
    var q = `repo:${owner}/${repo} is:issue is:open  updated:>=${UpdatedEarlierThan} `
    if (ExcludeLabel.length!=0){
    for (var i in ExcludeLabel){
      q+='-label:'+ExcludeLabel[i]+' '
    }
    }
    if (TargetMilestone.length!=0){
      for (var i in TargetMilestone){
      q+='milestone:'+TargetMilestone[i]+' '
    }
    }
    if (Squadgroup.length!=0){
    for (var i in Squadgroup){
      var squadname='label:'+'squad:'+Squadgroup[i]+' '
      var eachsquad=q+squadname
        if (TargetLabel.length!=0){
          for (var i in TargetLabel){
          var labelname='label:'+TargetLabel[i]+' '
          var eachlabel=eachsquad+labelname
          this.logger.info(eachlabel)
          this.issuelocate(eachlabel)
        }
      }else{
        this.issuelocate(eachsquad)
      }

    }
  }
  this.issuelocate(q)
//issue => this.addlable(this.context.repo({number: issue.number})))
    return this.issuelocate(q)//neverRepliedArray.forEach(issue => this.addlable(this.context.repo({number: issue.number})))
  }


async issuelocate(q){
  const {Addedlablename} = this.config
  this.logger.info(q)
  //can easily add label by label:"${labelname}", to filter the label we want
  const params = {q, sort: 'updated', order: 'desc', per_page: 100}
  // this params is actually just a new built dictionary with : q,sort,order,per_page
  const issues = await this.github.search.issues(params)
  // this.logger.info(issues)
  this.logger.info('the total number of issues need to be updated is '+issues.data.total_count)
  // const time = new Date(issues[0].data.items.created_at)
  // this.logger.info('#%d is created time', owner, repo, time)
  if (issues.data.total_count===0) {
    this.logger.info('no issue found')
  }
  else{
  this.logger.info('issue created and updated time: '+ `${issues.data.items[0].created_at} + ${issues.data.items[0].updated_at}`)
  // this.logger.info(issues.data)
  }
      const neverRepliedArray = await scramjet.fromArray(issues.data.items).filter(issue =>
        // const event = await this.findneverRepliedIssue(owner, repo, issue.number)
        // const creationDate = new Date(event.created_at)
        // this.logger.info(issue.labels)
        issue.labels.find(o => o.name === Addedlablename)==null
     ).toArray()
     neverRepliedArray.forEach(issue => this.addlable(this.context.repo({number: issue.number})))
     return neverRepliedArray
}
// the function to add lable to target issues
async addlable(issue){

  const {tagComment, Addedlablename, perform} = this.config
  //
  // if (this.remainingActions === 0) {
  //   this.logger.info('Reach maximum turns')
  //   return
  // }
  // this.logger.info(issue)
  this.logger.info('Starting add label')
  // this.remainingActions--
  // this.logger.info(`${Addedlablename}`)
  //
  //issues.forEach(issue => this.close(this.context.repo({number: issue.number})))
  //this.github.issues.getLabel(this.context.repo({name})).catch(() => {
  //  return this.github.issues.createLabel(this.context.repo({name, color}))

  const {owner,repo} = this.context.issue()
  // var owner = issue.owner
  // var repo = issue.repo
   var num =issue.number
   //this.issuesnum.push('These issues are stale: \n');
  this.issuesnum.push(num);


if (perform){
  await this.github.issues.createComment(Object.assign({}, issue, {body: tagComment}))
  return this.github.issues.addLabels({owner, repo, number: issue.number, labels: [Addedlablename]})
  }
}

  async close (issue) {
    const {closeComment, perform} = this.config
    var num =issue.number
    this.issuesnum.push('These issues are closed by bot: '+ num +' \n ');


    if (perform) {
      this.logger.info('%s/%s#%d is being closed', issue.owner, issue.repo, issue.number)
      await this.github.issues.update(Object.assign({}, issue, {state: 'closed'}))
      if (closeComment) {
        return this.github.issues.createComment(Object.assign({}, issue, {body: closeComment}))
      }
    } else {
      this.logger.info('%s/%s#%d would have been closed (dry-run)', issue.owner, issue.repo, issue.number)
    }
  }
// async findneverRepliedIssue (owner, repo, number) {
//   const {responseRequiredLabel} = this.config
//   const params = {owner, repo, issue_number: number, per_page: 100}
//   const events = await this.github.paginate(this.github.issues.getEvents(params))
//   return events[0].data.reverse()
//                .find(event => event.event === 'labeled' && event.label.name === responseRequiredLabel);
// }

since (days) {
  const ttl = days * 24 * 60 * 60 * 1000
  var ISOwithouttimer = (new Date(new Date() - ttl)).toISOString().substring(0, 19);
  return ISOwithouttimer
}


//unmark function
async unmark (issue) {
  const {perform, Addedlablename,tagComment} = this.config
  const filterrecent= this.since(1)
  const {owner, repo, number} = issue
  const comment = this.context.payload.comment
  const issueInfo = await this.github.issues.get(issue)
  const events = await this.github.issues.listComments({owner, repo, number, filterrecent})
  if (this.ResponseLabelExists(issue)) {
    if (perform) {
      if(events.data[events.data.length-1].body!=tagComment){
      this.logger.info('%s/%s#%d is being unmarked', owner, repo, number)
      await this.github.issues.removeLabel({owner, repo, number, name: Addedlablename})
    }
      if (issueInfo.data.state === 'closed') {
        this.github.issues.edit({owner, repo, number, state: 'open'})
      }
    } else {
      this.logger.info('%s/%s#%d would have been unmarked (dry-run)', owner, repo, number)
    }
  }
}

async ResponseLabelExists (issue) {
  const labels = await this.github.issues.listLabelsOnIssue(issue)

  return labels.data.map(label => label.name).includes(this.config.Addedlablename)
}



}
