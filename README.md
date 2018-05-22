# GAME OF LIFE for EOS in Type Script

## 1 Clone and install assemblyscript

```bash
git clone https://github.com/EOSArgentina/assemblyscript.git
cd assemblyscript
npm install
npm link
```

## 2 Compile

```bash
asc eos-ts.ts -o eos-ts.wast --optimize --validate
```

## 3 Hack the wast 
```bash
sed -i 's/,/_/g' eos-ts.wast
```

## 4 Deploy contract
```bash
cleos set contract eosts ~/dev/eos-ts -p eosts
```

## 5 Call TypeScript action
```bash
cleos push action eosts sayhello '["olakease"]' -p eosts
```
