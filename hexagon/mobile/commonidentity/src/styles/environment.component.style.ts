import styled from "styled-components/native";
import { hxgn_text_200, hxgn_text_300, root_view_style } from '@galileo/mobile_commonlibraries'

export const RootView = styled.View`
    ${root_view_style.main}
`;

// left: ${props => (props.left/2 - 24)/2}px;
// top: ${props => (props.top/2 -32)/2 - 219}px;
export const TitleText = styled.Text`
    position: absolute;
    width: 248px;
    height: 32px;
    left: 71px;
    right: 71px;
    top: 187px;

    font-family: 'Selawik';
    font-style: normal;
    font-weight: 600;
    font-size: 24px;
    line-height: 32px;

    color: #FFFFFF;
`; 

// left: 16.67%;
// right: 16.92%;
// top: 28.67%;
// bottom: 69.43%;
export const SubTitleText = styled.Text`
    position: absolute;
    left: 65px;
    right: 65px;
    top: 242px;

    font-family: 'Selawik';
    font-style: normal;
    font-weight: 400;
    font-size: 12px;
    line-height: 16px;

    color: #FFFFFF;
`; 

export const TextInput = styled.TextInput`
    position: absolute;
    height: 32px;
    left: 62px;
    right: 64px;
    top: 281px;
    padding: 0px;
    padding-left: 5px;

    background: #FFFFFF;
    border: 1px solid #ADAFB2;
    color: #C0C0C0;

    ${hxgn_text_300.main}
`;

export const ContinueButton = styled.TouchableOpacity`
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    padding: 0px 8px;

    position: absolute;
    width: 104px;
    height: 32px;
    left: 222px;
    top: 335px;

    background: #F7F7F7;
    border: 1px solid #ADAFB2;
    box-shadow: 0px 1px 1px rgba(0, 0, 0, 0.2);
`;

export const ContinueButtonText = styled.Text`
    color: #000000;

    ${hxgn_text_200.main}
`; 

export const ImageBackground = styled.ImageBackground`
    flex: 1;
    justify-content: center;
`;
