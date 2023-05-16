import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import parse from "html-react-parser";
import DOMPurify from "dompurify";
import ElasticSearchService from "../../services/ElasticSearch.service";

const bannerHeight = 21;

export default function Banner({
  mainContentWrapperTop,
  setMainContentWrapperTop
}) {
  const isChrome = navigator.userAgent.includes('Chrome');

  const codaHealth = useSelector((state) => state.global.codaHealth);
  const devMode = useSelector((state) => state.global.devMode);
  const mode = useSelector((state) => state.global.mode);

  const [showErrorBanner, setShowErrorBanner] = useState(false);
  const [showSupportedBrowserBanner, setShowSupportedBrowserBanner] = useState(false);
  const [showDevBanner, setShowDevBanner] = useState(true);
  const [showStagingBanner, setShowStagingBanner] = useState(false);
  const [showHealthyBanner, setShowHealthyBanner] = useState(false);
  const [showUpdateComingBanner, setShowUpdateComingBanner] = useState(false);

  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [bannerHTML, setBannerHTML] = useState(null);

  useEffect(() => {
    // Show Supported Browser Banner
    if (!isChrome) {
      // Browser doesn't report to be chrome.  Put up a banner 
      // informing the user to switch to chrome.
      console.log("before: " + mainContentWrapperTop);
      setMainContentWrapperTop(mainContentWrapperTop => mainContentWrapperTop + bannerHeight);
      console.log("after: " + mainContentWrapperTop);
      setShowSupportedBrowserBanner(true);
    }

    // Show Dev Banner
    if (!devMode && mode !== "dev") {
      setMainContentWrapperTop(mainContentWrapperTop => mainContentWrapperTop - bannerHeight);
      setShowDevBanner(false);
    }

    // Show Staging Banner
    if (mode === "stage") {
      setMainContentWrapperTop(mainContentWrapperTop => mainContentWrapperTop + bannerHeight);
      setShowStagingBanner(true);
    }

    // All Other Error Banners
    // this._dgraphService.logPrismEvent({ "product": "codaweb", "tool": "codauiOpen" });
    // if (!CodaGlobals.devmode) {
    //   let prismEventUrl = this._dgraphService.prismEventURL;
    //   window.onbeforeunload = event => {
    //     this._dgraphService.userObj.then(userObj => {
    //       //need to use plain javascript ajax call so that it we can set async to false
    //       let data = { "product": "codaweb", "tool": "codauiClose", "mode": CodaGlobals.mode, "username": userObj["username"] };
    //       let xmlhttp = new XMLHttpRequest();
    //       xmlhttp.open("POST", prismEventUrl, false);
    //       xmlhttp.setRequestHeader("Content-type", "application/json");
    //       xmlhttp.setRequestHeader("X-Prism", "3904fbf04ba6fdb5bdc508c4cd1bbbce");
    //       xmlhttp.send(JSON.stringify(data));
    //       return null;
    //     });
    //   };
    // }

    // Get Banner Data from Metadata
    var banner_url = "pers.q.config.codaweb.banner.dev";

    if (mode === "dev") {
      banner_url = "pers.q.config.codaweb.banner.dev";
    } else if (mode === "stage") {
      banner_url = "pers.q.config.codaweb.banner.staging";
    } else {
      banner_url = "pers.q.config.codaweb.banner.prod";
    }

    ElasticSearchService.getBannerData(banner_url, devMode)
      .then(data => {
        const tmpBannerHTML = parse(DOMPurify.sanitize(data[banner_url]));
        setBannerHTML(tmpBannerHTML)

        if (localStorage.getItem("dismissedUpdateBanner") === String(tmpBannerHTML)) {
          setShowUpdateComingBanner(false);
        } else {
          setMainContentWrapperTop(mainContentWrapperTop => mainContentWrapperTop + bannerHeight);
          setShowUpdateComingBanner(true);
        }
      })
      .catch(error => {
        console.log(error);
      });
  }, []);

  const checkHealth = () => {
    if (codaHealth && codaHealth['mongo-connector'].status === 'green' && codaHealth['rdispatcher'].status === 'green' && codaHealth['rgoferd'].status === 'green') {
      if (showErrorBanner) {
        setShowHealthyBanner(true);
        setShowErrorBanner(false);
        setBannerDismissed(false);
        window.setTimeout(() => {
          if (!bannerDismissed) {
            setMainContentWrapperTop(mainContentWrapperTop => mainContentWrapperTop - bannerHeight);
          }
          setShowHealthyBanner(false);
        }, 30000);
      }
    } else {
      if (codaHealth && !showErrorBanner) {
        setMainContentWrapperTop(mainContentWrapperTop => mainContentWrapperTop + bannerHeight);
        setShowErrorBanner(true);
        setBannerDismissed(false);
        setShowHealthyBanner(false);
      }
    }
  }

  const dismissBanner = () => {
    setMainContentWrapperTop(mainContentWrapperTop => mainContentWrapperTop - bannerHeight);
    setBannerDismissed(true);
  }

  const dismissUpdateBanner = () => {
    setMainContentWrapperTop(mainContentWrapperTop => mainContentWrapperTop - bannerHeight);
    setBannerDismissed(true);
    localStorage.setItem('dismissedUpdateBanner', String(bannerHTML));
  }

  return (
    <div className="banner-wrapper">
      {showSupportedBrowserBanner && <div className="top-browser-banner">
        <span class="glyphicon glyphicon-exclamation-sign"></span>
        <small>This is an unsupported browser.  Please switch to Chrome for full support</small>
      </div>}
      {showDevBanner && <div className="top-devenv-banner">
        <span className="glyphicon glyphicon-exclamation-sign"></span>
        <small>This is a <b>development</b> instance.</small>
      </div>}
      {showStagingBanner && <div className="top-new-banner">
        <span class="glyphicon glyphicon-exclamation-sign"></span>
        <small>
          Welcome to the <b>staging</b> instance of the new Codaweb.
          <a href="mailto:coda-dev@disneyanimation.com" target="_blank" rel="noreferrer">Let us know</a> where we can make improvements.
        </small>
      </div>}
      {showHealthyBanner && !bannerDismissed && <div className="top-healthy-banner">
        <span class="glyphicon glyphicon-ok-sign"></span>
        <small>We're back! Job lists are updating normally now.</small>
        <span class="glyphicon glyphicon-remove pull-right" onClick={() => dismissBanner()}></span>
      </div>}
      {showUpdateComingBanner && !bannerDismissed && <div className="top-new-banner">
        <span class='glyphicon glyphicon-star'></span>
        <small>
          <span innerHTML={bannerHTML}></span>
        </small>
        <span class='glyphicon glyphicon-remove pull-right' onClick={() => dismissUpdateBanner()}></span>
      </div>}
    </div>
  )
}