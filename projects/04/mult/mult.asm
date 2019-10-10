// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/04/Mult.asm

// Multiplies R0 and R1 and stores the result in R2.
// (R0, R1, R2 refer to RAM[0], RAM[1], and RAM[2], respectively.)

// Put your code here.
@R2
M=0 // 結果を格納するR2 を0 で初期化
@R1
D=M
@END
D;JLE // R1 が0 以下の場合はEND へジャンプ
(LOOP)
@R0
D=M
@R2
M=M+D // R2 += R0
@R1
MD=M-1 // R1 をデクリメント
@LOOP
D;JGT // R1 > 0 の時, Loop にジャンプ
(END)
@END
0;JMP // 無限ループはHack プログラムを"終了させる"