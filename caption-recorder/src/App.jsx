import './App.css';

import { AnimatePresence } from 'framer-motion';
import { useCallback, useState } from 'react';

import Bubble from './bubble';
import BubbleInput from './bubble-input';
import Chat from './chat';
import useMessages from './use-messages';

function App() {

	/** List of messaged that has been sent */
	const [messages, addMessage] = useMessages([])

	/** New message being typed */
	const [newMessage, setNewMessage] = useState('')

	/** Adds new message to list */
	const handleSubmit = useCallback(() => {
		if (newMessage.length > 0) {
			addMessage(newMessage)
			setNewMessage('')
		}
	}, [newMessage, messages])

	return (
		<div className="App">
			<Chat>
				<AnimatePresence>
					{messages.map(m => (
						<Bubble key={m} id={m}>
							{m}
						</Bubble>
					))}
				</AnimatePresence>
				<BubbleInput
					value={newMessage}
					onChange={setNewMessage}
					onSubmit={handleSubmit}
				/>
			</Chat>
		</div>
	)
}

export default App
