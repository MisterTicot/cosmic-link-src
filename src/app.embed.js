"use strict"
/**
 * Widget interface initialization.
 */
const { View } = require("@kisbox/browser")

const AppState = require("./app.state")
const SigningWidget = require("./view/signing-widget")

/* Definition */

class AppEmbed extends View {
  constructor (params) {
    super(`
<div class="CosmicLinkApp" %hidden>
  <main>
    <hr>
    %signingWidget
  </main>
</div>
    `)

    this.state = new AppState(params)
    this.signingWidget = new SigningWidget(this.state)
    this.$pull("route", this.state, "query", x => x || "")
  }
}

/* Export */
module.exports = AppEmbed
