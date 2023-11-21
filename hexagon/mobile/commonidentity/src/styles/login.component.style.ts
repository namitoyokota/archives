import styled from "styled-components/native";
import { root_view_style } from "@galileo/mobile_commonlibraries";

export const RootView = styled.View`
    ${root_view_style.main}
`;

export const WebViewContainer = styled.View`
    flex: 1;
    position: absolute;
    width: 300px;
    height: 515px;
    left: 44px;
    top: 100px;

    background: #FFFFFF;
    box-shadow: 2px 2px 0px rgba(0, 0, 0, 0.25);
    shadow-radius: 2px;

    border-radius: 4px;
`

export const LoginImageBackground = styled.ImageBackground`
    flex: 1;
    justify-content: center;
`;