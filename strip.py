import os, re
for r, _, fs in os.walk('backend'):
    for f in fs:
        if f.endswith('.py'):
            p = os.path.join(r, f)
            with open(p, 'r', encoding='utf-8') as file:
                data = file.read()
            data = re.sub(r'[^\x00-\x7F]+', '', data)
            with open(p, 'w', encoding='utf-8') as file:
                file.write(data)
