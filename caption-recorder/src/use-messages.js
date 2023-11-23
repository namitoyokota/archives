import { useCallback, useState } from 'react';

const useMessages = (initialValue = []) => {

	/** List of messages to display */
	const [messages, setMessages] = useState(initialValue)

	/** Sets messages with delay */
	const addMessage = useCallback(
		msg => {
			setMessages(messages => [...messages, msg])
			setTimeout(() => {
				setMessages(current => {
					const n = [...current]
					n.shift()
					return n
				})
			}, 5000)
		},
		[setMessages]
	)

	return [messages, addMessage]
}

export default useMessages
