import requests
import json

favorites = ['john+1:1-2', 'genesis+1:27', 'matthew+17:20']

f = open("teachings.json", "w")
f.write("[\n")

count = 0
for favorite in favorites:
    count += 1
    r = requests.get('https://bible-api.com/' + favorite)
    data = json.loads(r.text)
    current = data['verses']

    text = ''
    for verse in current:
        text += verse['text']
    text = text.replace('\n', ' ')
    text = text.replace('  ', ' ')

    print(data['reference'])
    print(text)

    f.write("\t\"")
    f.write(text + "-" + data['reference'])
    f.write("\"")

    if (count != len(favorites)):
        f.write(",\n")

f.write("\n]")
f.close()
