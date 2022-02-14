const puppeteer = require('puppeteer');
require('dotenv').config()

const login = async () => {
    const browser = await puppeteer.launch({
        headless: false,
        ignoreHTTPSErrors: true,
        args: [`--window-size=${1280},${1024}`]
    });

    const page = await browser.newPage();
    await page.goto(`http://${process.env.IP}/cgi-bin/login_page.tcl`);

    await page.waitForSelector("#user")
    await page.type("#user", process.env.USERNAME, {delay: 100});
    await page.type("#pw", process.env.PASSWORD, {delay: 100});

    await page.click("#login");

    return page;
}

const readCurrentOutput = async (page) => {
    const element = await page.waitForSelector("td#curr_power");
    const value = await element.evaluate(el => el.textContent);
    return value;
}

const readProdToday = async (page) => {
    const element = await page.waitForSelector("td#prod_today");
    const value = await element.evaluate(el => el.textContent);
    return value;
}


const close = async (page, logoutUrl) => {
    await page.goto(logoutUrl)
    await page.browser().close();
}

const start = async () => {
    const page = await login();

    await page.waitForTimeout(5000);
    const pageUrl = page.url();
    const overviewUrl = pageUrl.replace("frameset", "overview");
    await page.goto(overviewUrl);

    const currentOutput = await readCurrentOutput(page);
    const prodToday = await readProdToday(page);
    console.log({
        timestamp: new Date().getTime(),
        currentOutput: currentOutput,
        prodToday: prodToday
    })

    await page.waitForTimeout(5000);

    const logoutUrl = pageUrl.replace("frameset", "logout");
    await close(page, logoutUrl);
}

try {
    void start();
} catch (e) {
    console.log("error", e);
}
