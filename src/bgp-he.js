import Nightmare from 'nightmare'
import { log } from 'console'
import { argv } from 'process'
import cheerio from 'cheerio'
import {
  camelCase
} from 'lodash'
async function nm (opts = {}) {
  return new Nightmare(options)
}

class BGP {
  constructor () {
    this.url = `bgp.he.net`
    this.nm = new Nightmare({
      show: false
    })
  }
  async fetch (url) {
    await this.nm.goto(url)
    return this.nm
  }
  async dns (domain) {
    let url = `https://${this.url}/dns/${domain}`
    await this.fetch(url)
    
    return await this.nm
    .wait('#footer')
    .wait('.webthumb')
    .wait(3000)
    .evaluate(() => {
        return document.querySelector('body').innerHTML
      })
      .end();
    }
}
function dnsInfo (html) {
  let $ = cheerio.load(html)
  let dns = {}
  let dnsHeaders = $('.dnshead').toArray()
    .map(x => $(x).html().trim().split('\n'))
  let dnsData = $('.dnsdata').toArray()
    .map(x => $(x).html().trim().split('\n'))
  // log({[camelCase(dnsHeaders)]: dnsData})
  for (let i = 0; i < dnsHeaders.length; i++) {
    let header = camelCase(dnsHeaders[i])
    let data = dnsData[i].map(x => x.trim()).filter(x => !!x)

    if (header === 'startOfAuthority') {
      console.dir('startOfAuthority', {header})
      // data = data.map(x => x.split(':').map(y => ({[y[0]]: y[1].trim()})))
      let _tmp = {}
      data = data.map(x => {
        return x.split(':').map(x => x.replace('<br>', '').trim())
      }).forEach(y => _tmp[y[0]] = y[1])
      data = _tmp
    }
    else if (header === 'txtRecords') {
      data = data.map(x => x.replace('<br>', '')).filter(x => !!x)
    }
    else {
      data = data.map(x => x
        .replace('<br>', '')
        .replace('(1)', '')
        .split(',')
        .map(x => x.replace('(1)', '').trim())).filter(x => !!x)[0]
        .map(x => {
          const $ = cheerio.load(x);
          return { title: $('a').attr('title'), href: `https://${bgp.url}${$('a').attr('href')}` }
        })
    }
    dns[header] = data
  }
  return dns
}
function websiteInfo (html) {
  let $ = cheerio.load(html)
  return $('.webthumb img').attr('src')
}
function ipInfo (html) {
  let $ = cheerio.load(html)
  let links = $('a').toArray().map(x => ({
    title: $(x).attr('title'),
    href: $(x).attr('href')
  }))
  return links
}
function getJson(data) {
  return JSON.stringify(data, null, 2)
}
let bgp = new BGP()

;(async () => {
    let _dnsInfo = {}
    let html = (await bgp.dns('yahoo.com'))
 
    _dnsInfo.dns = dnsInfo(html)
    _dnsInfo.screenshot = websiteInfo(html)
    _dnsInfo.ipinfo = ipInfo(html)

    log(getJson(_dnsInfo))
})()
