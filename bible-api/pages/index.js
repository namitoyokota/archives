/** @format */

import Head from "next/head";

const Home = () => (
  <div className="container">
    <Head>
      <title>Jesus.rest</title>
      <link
        rel="icon"
        href="https://img.icons8.com/doodle/115/000000/summer.png"
      />
      <link
        rel="stylesheet"
        href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css"
        integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T"
        crossorigin="anonymous"
      ></link>
    </Head>
    <main>
      <h1 className="title">Jesus.rest</h1>

      <div className="content">
        <h4 className="heading">Purpose</h4>
        <p>
          This project is a REST API designed to get a randomized teachings by
          Jesus taken from the 4 Gospels: Matthew, Mark, Luke, and John.{" "}
        </p>

        <div className="content">
          <h4 className="heading">Usage</h4>
          <div className="code-wrap">
            <code>
              GET{" "}
              <a href="https://godrest.nyokota.workers.dev" target="_blank">
                https://godrest.nyokota.workers.dev
              </a>
            </code>
          </div>

          <h4 className="heading">Contributing</h4>
          <p>
            Jesus.rest is an open-source project made with JavaScript and NextJS
            licensed under{" "}
            <a
              href="https://github.com/namitoyokota/Jesus.rest/blob/master/LICENSE"
              target="_blank"
              rel="noopener noreferrer"
            >
              MIT
            </a>
            ! To contribute, open pull request with improvements or discuss
            ideas in issues on the GitHub repository{" "}
            <a
              href="https://github.com/namitoyokota/Jesus.rest"
              target="_blank"
              rel="noopener noreferrer"
            >
              here
            </a>
            .
          </p>

          <h4 className="heading">Upcoming</h4>
          <p>
            <ul>
              <li>New icon</li>
              <li>Scripture request form</li>
              <li>New domain</li>
            </ul>
          </p>

          <hr />
          <div className="footer">
            <p>&copy; Namito Yokota</p>
          </div>
        </div>
      </div>
    </main>

    <style jsx global>{`
      html,
      body {
        padding: 0;
        margin: 0;
        font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen,
          Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
        margin: 0;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        height: 100%;
        background: var(--bg);
        background-image: radial-gradient(#ddd 1px, transparent 0),
          radial-gradient(#ddd 1px, transparent 0);
        background-position: 0 0, 25px 25px;
        background-attachment: fixed;
        background-size: 50px 50px;
        overflow-x: hidden;
      }
    `}</style>
  </div>
);

export default Home;
