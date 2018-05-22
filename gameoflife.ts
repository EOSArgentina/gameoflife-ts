import "allocator/arena";

import {env as EOS, ISerializable, Contract} from "./eoslib";
import {DataStream} from "./datastream";
import {printstr, N, assert} from "./utils";
import {Board, BoardSize} from "./models";
import {Create, Remove, RemoveAll, Step} from "./actions";

export class GameOfLife extends Contract {

  dummy : u64;

  // step action
  on_step(args: Step) : void {
    EOS.require_auth(args.user);

    let it = EOS.db_find_i64(this.receiver, args.user, N("boards"), args.game);
    assert(it >= 0, "game not found");
    
    let len = EOS.db_get_i64(it, 0, 0);
    assert(len >= 0, "invalid length");

    let arr = new Uint8Array(len);
    len = EOS.db_get_i64(it, <usize>arr.buffer, len);
    assert(len >= 0, "invalid length");

    let ds = new DataStream(<usize>arr.buffer, len);
    let old = Board.from_ds(ds);

    let bsize = old.get_size();
    
    let board = new Board();
    board.game = old.game;
    board.rows = new Array<string>(old.rows.length);

    for (var r:i32 = 0; r < bsize.num_rows; ++r) {
        board.rows[r] = "";
        for (var c:i32 = 0; c < bsize.num_cols; ++c) {
            
            let neighbors = Board.alive(old, bsize, r, c, -1, -1) +
                            Board.alive(old, bsize, r, c, -1,  0) +
                            Board.alive(old, bsize, r, c, -1,  1) +
                            Board.alive(old, bsize, r, c,  0, -1) +
                            Board.alive(old, bsize, r, c,  0,  1) +
                            Board.alive(old, bsize, r, c,  1, -1) +
                            Board.alive(old, bsize, r, c,  1,  0) +
                            Board.alive(old, bsize, r, c,  1,  1);
            
            if (neighbors == 3 || (Board.alive(old, bsize, r, c,  0,  0)!=0 && neighbors == 2))
              board.rows[r] += "*";
            else
              board.rows[r] += " ";
        }
    }

    arr = new Uint8Array(64000);
    ds = new DataStream(<usize>arr.buffer, len);
    Board.to_ds(board, ds);
    EOS.db_update_i64(it, args.user, ds.buffer, ds.pos);
  }

  // remove all action
  on_remove_all(args: RemoveAll) : void {
    EOS.require_auth(args.user);

    let it = EOS.db_lowerbound_i64(this.receiver, args.user, N("boards"), 0);
    
    while (it >= 0) {
      let del = it;
      it = EOS.db_next_i64(it, offsetof<this>("dummy"));
      EOS.db_remove_i64(del);
    }
  }

  // remove action
  on_remove(args : Remove) : void {
    EOS.require_auth(args.user);
    let it = EOS.db_find_i64(this.receiver, args.user, N("boards"), args.game);
    if (it >= 0) {
      EOS.db_remove_i64(it);
    }
  }

  // create action
  on_create(args : Create) : void {

    this.on_remove(new Remove(args.user, args.game));
    assert(args.num_rows >= 3 && args.num_rows <= 100,
            "num_rows out of range [3 100]");
    assert(args.num_cols >= 3 && args.num_cols <= 100,
            "num_cols out of range [3 100]");

    let board = Board.gen_random(args.game, args.num_rows, args.num_cols, args.seed);
    
    let arr = new Uint8Array(64000);
    let ds = new DataStream(<usize>arr.buffer, 64000);

    Board.to_ds(board, ds);
    let it = EOS.db_store_i64(args.user, N("boards"), args.user, args.game,  ds.buffer, ds.pos);
  }

  apply(code: u64, action: u64) : void {
    if( action == N("create") ) {
      this.on_create(Create.from_ds(this.get_ds()));
    } else if( action == N("remove") ) {
      this.on_remove(Remove.from_ds(this.get_ds()))
    } else if( action == N("removeall") ) {
      this.on_remove_all(RemoveAll.from_ds(this.get_ds()))
    } else if( action == N("step") ) {
      this.on_step(Step.from_ds(this.get_ds()))
    } else {
      assert(false, "unknown action");
    }
  }

}

export function apply(receiver: u64, code: u64, action: u64): void {
  var gol : GameOfLife = new GameOfLife(receiver);
  gol.apply(code, action);
}