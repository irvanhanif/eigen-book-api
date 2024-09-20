public class case4 {
    public static void main(String[] args) {
        int [][] Matrix = new int[][]{{1,2,0},{4,5,6},{7,8,9}};
        
        int diagonalPertama = 0, diagonalKedua = 0, j = Matrix[0].length-1;
        for (int i = 0; i < Matrix[0].length; i++) {
            diagonalPertama += Matrix[i][i];
            diagonalKedua += Matrix[i][j];
            if(j >= 0) j--;
        }

        System.out.printf("maka hasilnya adalah %d - %d = %d", 
            diagonalPertama, 
            diagonalKedua, 
            diagonalPertama - diagonalKedua
        );
    }
}
