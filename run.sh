./build.sh
cleos wallet unlock --password $(cat ~/.pass)
cleos create account eosio eosio.token  EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV
cleos set contract eosio.token ~/dev/eos/build/contracts/eosio.token -p eosio.token
cleos push action eosio.token create '[ "eosio", "1000000000.0000 EOS", 0, 0, 0]' -p eosio.token
cleos push action eosio.token issue '[ "eosio", "1000000000.0000 EOS", "memo" ]' -p eosio
cleos set contract eosio ~/dev/eos/build/contracts/eosio.system -p eosio
cleos system newaccount --buy-ram-bytes 300 --stake-net "100.0000 EOS" --stake-cpu "100.0000 EOS" eosio gameoflifets EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV 
cleos set contract gameoflifets ~/dev/gameoflife-ts -p gameoflifets
cleos push action gameoflifets create '["gameoflifets","game1",3,3,100]' -p gameoflifets
