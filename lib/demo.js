const scramjet = require('scramjet')
const fs = require('fs');
const axios=require ('axios')
const excel = require('excel4node');
var XLSX = require('xlsx');

module.exports = class icpbot{
  constructor (context, config, logger) {
    this.context = context//repository info
    this.github = context.github
    this.config = config//yml file's content
    this.logger = logger
  }

// main function
  async sweep () {
    this.issuesnum=[]
    this.logger.debug('Starting sweep')
    this.getLoggerinfo()
    //const Closeableissues = await this.getClosableIssues()
    //const Labelissues =await this.getrequiredIssues()

    //Closeableissues.forEach(issue => this.close(this.context.repo({number: issue.number})))
    var d = new Date()
    console.log(d.toJSON().slice(0,19).replace('T',':'))
    await fs.appendFileSync('output.txt','Result recorded at '+d.toJSON().slice(0,19).replace('T',':')+':',(error)=>{
    console.log(error)
    })
    if(this.issuesnum=== [] || this.issuesnum == 0){
      fs.appendFileSync('output.txt',` no issue requiring stale tag is found \n`
      , (err) => {
        // throws an error, you could also catch it here
        if (err) throw err
        // success case, the file was saved
        this.logger.info('0 issue is found \n')
        }
      )
    }
    else{
    fs.appendFileSync('closed_issue.txt',`The issues got closed are: ${this.issuesnum} \n`, (err) => {
      // throws an error, you could also catch it here
      if (err) throw err
      // success case, the file was saved
      this.logger.info('output to file succesed \n')
      }
    )}
  }
  async getLoggerinfo(){
    var listofmember = [];
    var workbook = XLSX.readFile('./Book1.xlsx');
    var sheet_name_list = workbook.SheetNames;
    console.log(sheet_name_list)
    var json_list=XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]])
    this.logger.info(json_list)

    //   fs.readFile('/Users/Weiwen.Zhao@ibm.com/Downloads/ICP-user-squad.txt', 'utf8', function(err,data) {
    //     if(err) throw err;
    //
    //     let splitted = data.toString().split("\n");
    //     //console.dir(splitted, {'maxArrayLength': null} )
    //     for (let i = 0; i<splitted.length; i++) {
    //         let splitLine = splitted[i].split(":");
    //         listofmember.push(splitLine)
    //     }
    // });

    var workbook = new excel.Workbook();
    var worksheet = workbook.addWorksheet('Sheet 2');
    var style = workbook.createStyle({
      font: {
        color: '#000000',
        size: 12
      },
      numberFormat: '$#,##0.00; ($#,##0.00); -'
    });
    const {owner, repo} = this.context.repo()
    var q = `repo:${owner}/${repo} is:issue created:2019-02-04T00:00:01..2019-03-24T03:01:50 label:bug -label:"squad:cf" -label:"squad:cicd" -label:"squad:compliance" -label:"squad:content" -label:"squad:design" -label:"squad:doc" -label:"squad:L3" -label:"squad:offering-mgmt" -label:"squad:release_mgt" -label:"squad:support" -label:"squad:workload-cam"`

    this.logger.info(q)
    const params = {q, sort: 'created', order: 'desc', per_page: 100,page:7}

    const issues = await this.github.search.issues(params)

    // Set value of cell A1 to 100 as a number type styled with paramaters of style
    worksheet.cell(1,1).string('Issue number').style(style);

    // Set value of cell B1 to 300 as a number type styled with paramaters of style
    worksheet.cell(1,2).string('Title').style(style);

    // Set value of cell C1 to a formula styled with paramaters of style
    worksheet.cell(1,3).string('Issue logger').style(style);

    // Set value of cell A2 to 'string' styled with paramaters of style
    worksheet.cell(1,4).string('Open date').style(style);

    worksheet.cell(1,5).string('Opened by Squad').style(style);

    worksheet.cell(1,6).string('Solved by Squad').style(style);

    for (var i = 2; i <= issues.data.items.length+1; i++){
      var squads=[]
      worksheet.cell(i,1).number(issues.data.items[i-2].number).style(style);
      worksheet.cell(i,2).string(issues.data.items[i-2].title).style(style);
      worksheet.cell(i,3).string(issues.data.items[i-2].user.login).style(style);
      for (let j = 0; j<json_list.length; j++){
        if (issues.data.items[i-2].user.login==json_list[j].ID){
          worksheet.cell(i,5).string(json_list[j].Squad).style(style);
          break
        }
      }
      if(issues.data.items[i-2].assignees!=null){
      for (var z=0; z<issues.data.items[i-2].assignees.length;z++){
        for(let k = 0; k<json_list.length; k++){
          if(issues.data.items[i-2].assignees[z].login==json_list[k].ID){
            squads.push(json_list[k].Squad)
            break
          }
        }

        }


        squads=  [...new Set(squads)]
       for (let num in squads){
         this.logger.info(squads[num])
         worksheet.cell(i,6+parseInt(num)).string(squads[num]).style(style);
      }


    }
      worksheet.cell(i,4).string(issues.data.items[i-2].created_at).style(style);

  }
    workbook.write('Excel.xlsx');

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
    const {DaysuntilAdd,Squadgroup,TargetLabel,ExcludeMilestones,ExcludeLabel,Addedlablename} = this.config
    const UpdatedEarlierThan = this.since(DaysuntilAdd)
    this.logger.info('will add label to issues updated earlier than '+UpdatedEarlierThan)
    // find updated time is before certain amount of days, then check if updated_time is created_time
    var q = `repo:${owner}/${repo} is:issue is:open  updated:<=${UpdatedEarlierThan} `
    if (ExcludeLabel.length!=0){
    for (var i in ExcludeLabel){
      q+='-label:'+ExcludeLabel[i]+' '
    }
    }
    if (Squadgroup.length!=0){
    for (var i in Squadgroup){
      var squadname='label:'+`"squad:${Squadgroup[i]}" `
      var eachsquad=q+squadname
        if (TargetLabel.length!=0){
          for (var i in TargetLabel){
          var labelname='label:'+TargetLabel[i]+' '
          var eachlabel=eachsquad+labelname
          await this.issuelocate(eachlabel)
        }
      }else{
        await this.issuelocate(eachsquad)
      }
    }
  }
    //issue => this.addlable(this.context.repo({number: issue.number}))
    return //this.issuelocate(q)//neverRepliedArray.forEach(issue => this.addlable(this.context.repo({number: issue.number})))
  }


async issuelocate(q){
  const {Addedlablename,ExcludeMilestones} = this.config

  const params = {q, sort: 'updated', order: 'desc', per_page: 100}
  const issues = await this.github.search.issues(params)
  //this.logger.info(q)
  //this.logger.info('the total number of issues need to be updated is '+issues.data.total_count)
  // const time = new Date(issues[0].data.items.created_at)
  if (issues.data.total_count===0) {
    //this.logger.info('no issue found')
  }
  else{
  this.logger.info('issue created and updated time: '+ `${issues.data.items[0].created_at} + ${issues.data.items[0].updated_at}`)
  }
//pop out ExcludeMilestones after this.github.search.issues()
//because the github Api don't provide function to exclude multiple milestones, So wrote a separate function to do that
  for (var i = issues.data.items.length -1; i >= 0; i--){
    if (ExcludeMilestones.length!=0){
      for (var j in ExcludeMilestones){
        //this.logger.info(issues.data.items[i])
        if (issues.data.items[i]!=null){
          if(issues.data.items[i].milestone!=null){
            if (issues.data.items[i].milestone.title==ExcludeMilestones[j]){
              issues.data.items.splice(i, 1)
            }
          }
        }
      }
    }
  }
      const neverRepliedArray = await scramjet.fromArray(issues.data.items).filter(issue =>
        issue.labels.find(label => label.name === Addedlablename)==null
     ).toArray()
     neverRepliedArray.forEach(issue => this.addlable(this.context.repo({number: issue.number})))
     return neverRepliedArray
}
// the function to add lable to target issues
async addlable(issue){

  const {tagComment, Addedlablename, perform} = this.config
  this.logger.info('Starting add label')
  const {owner,repo} = this.context.issue()
   var num =issue.number
   //this.issuesnum.push('These issues are stale: \n');
  this.issuesnum.push(' \n This issues are tagged by bot: '+num)

if (perform){
  await this.github.issues.createComment(Object.assign({}, issue, {body: tagComment}))
  return this.github.issues.addLabels({owner, repo, number: issue.number, labels: [Addedlablename]})
  }
}

  async close (issue) {
    const {closeComment, perform} = this.config
    var num =issue.number
    this.issuesnum.push(' \n This issues are closed by bot: '+ num +' \n ');


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

since (days) {
  const ttl = days * 24 * 60 * 60 * 1000
  var ISOwithouttimer = (new Date(new Date() - ttl)).toISOString().substring(0, 19);
  return ISOwithouttimer
}


//unmark function
async unmark (issue) {

  const {perform, Addedlablename,tagComment,closeComment} = this.config
  const filterrecent= this.since(1)
  const {owner, repo, number} = issue
  const comment = this.context.payload.comment
  const issueInfo = await this.github.issues.get(issue)
  const events = await this.github.issues.listComments({owner, repo, number, since:filterrecent})

  if (await this.ResponseLabelExists(issue)) {
    if (perform) {
      if(events.data[events.data.length-1].body!=tagComment&&events.data[events.data.length-1].body!=closeComment){
        //Add this due to async function in the bot. Ensure the tag or close comment won't make the issue rerfreshed
      this.logger.info('%s/%s#%d is being unmarked', owner, repo, number)
      await this.github.issues.removeLabel({owner, repo, number, name: Addedlablename})
      fs.appendFile('unmarked.txt',`\n Issue #${number}` + ' is unmarked \n', (err) => {
        // throws an error, you could also catch it here
        if (err) throw err
        // success case, the file was saved
        this.logger.info('unmarked and output to file \n')
      }
     )
      if (issueInfo.data.state === 'closed') {
        this.github.issues.update({owner, repo, number, state: 'open'})
      }
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
