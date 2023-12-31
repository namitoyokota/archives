import { Heading, HStack, Image, Text, VStack } from '@chakra-ui/react';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';

const Card = ({ title, description, imageSrc }) => {
    return (
        <VStack spacing={5} backgroundColor='white' padding='10px' borderRadius='5px'>
            <Image src={imageSrc} borderRadius='5px' />
            <Heading color='black'>{title}</Heading>
            <Text color='grey'>{description}</Text>
            <HStack spacing={2} color='black'>
                <span>See More</span>
                <FontAwesomeIcon icon={faArrowRight} size='1x' />
            </HStack>
        </VStack>
    );
};

export default Card;
