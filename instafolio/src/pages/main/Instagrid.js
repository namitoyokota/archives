/** @format */

import * as React from "react";
import withInstagramFeed from "origen-react-instagram-feed";
import compose from "recompose/compose";
import styled from "styled-components";
import { Spinner, Row, Col } from "reactstrap";

const Image = styled.img`
  width: 100%;
  height: auto;
  object-fit: fill;
`;

const Front = styled.div`
  background-image: url("https://images.unsplash.com/photo-1513735539099-cf6e5d559d82?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1441&q=80");
  height: 500px;
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
`;

const Post = styled.div`
  max-width: 800px;
  margin: 50px auto;
  background: white;
  padding: 10px 30px;
  border-radius: 5px;
  color: #1f1f1f;
`;

const Content1 = styled.div`
  margin-top: 30%;
  text-align: left;
`;

const Content2 = styled.div`
  margin-top: 30%;
  text-align: right;
`;

const View = styled.p`
  margin-top: 30px;
  text-align: center;
`;

const InstaGrid = ({ media, profilePic, accountName, status }) => {
  return (
    <div>
      {media && status === "completed" && (
        <Front>
          <div className="profile">
            <img src={profilePic} className="profile-pic" alt="profile" />
          </div>
        </Front>
      )}
      {media &&
        status === "completed" &&
        media.map(({ displayImage, postLink, caption }, index) => (
          <Post>
            {index % 2 === 0 ? (
              <Row key={postLink}>
                <Col lg="6">
                  <Image alt="insta" src={displayImage} />
                </Col>
                <Col lg="6">
                  <Content1>
                    <h5>{caption}</h5>
                    <View>
                      <a href={postLink}>View</a>
                    </View>
                  </Content1>
                </Col>
              </Row>
            ) : (
              <Row key={postLink}>
                <Col lg="6">
                  <Content2>
                    <h5>{caption}</h5>
                    <View>
                      <a href={postLink}>View</a>
                    </View>
                  </Content2>
                </Col>
                <Col lg="6">
                  <Image alt="insta" src={displayImage} />
                </Col>
              </Row>
            )}
          </Post>
        ))}
      {status === "loading" && <Spinner color="primary" />}
      {status === "failed" && <p>failed...</p>}
    </div>
  );
};

export default compose(withInstagramFeed)(InstaGrid);
