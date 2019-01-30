const Icpbot = require('./lib/demo')
const createScheduler = require('probot-scheduler')
const getConfig = require('probot-config')
// /**
//  * This is the entry point for your Probot App.
//  * @param {import('probot').Application} app - Probot's Application class.
//  */

module.exports =async robot => {
  createScheduler(robot)
  robot.log('Yay, the app was loaded!')
  // robot.on('issues.opened', async context => {
  //   const issueComment = context.issue({ body: 'probot is working' })
  //   return context.github.issues.createComment(issueComment)
  // })
  robot.on('schedule.repository', addlable)
  robot.on('issue_comment', unmark)

  async function addlable (context) {
    const config = await context.config(`demo.yml`)
    if (config) {
      const configWithDefaults = Object.assign({}, require('./lib/defaults'), config)
      const bot = new Icpbot(context, configWithDefaults, robot.log)
      return bot.sweep()
    }
  }
  async function unmark (context) {
    const config = await context.config('demo.yml')

    if (config) {
      const configWithDefaults = Object.assign({}, require('./lib/defaults'), config)
      //object.assign will assign value from left to right. overwritten by order.
      const bot = new Icpbot(context, configWithDefaults, robot.log)
      return bot.unmark(context.issue())
    }
  }
}
