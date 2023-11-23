import './bubble.css';

import { motion } from 'framer-motion';
import React from 'react';

const Bubble = ({ id, children, sender }) => {
	return (
		<motion.div
			key={id}
			className="bubble"
			initial={{ opacity: 1, translateY: 60 }}
			animate={{ opacity: 1, translateY: 0 }}
			exit={{ opacity: 0 }}
		>
			{children}
		</motion.div>
	)
}

export default Bubble
