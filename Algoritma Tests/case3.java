import java.util.Arrays;

public class case3 {
    public static void main(String[] args) {
        String[] INPUT = new String[]{"xc", "dz", "bbb", "dz"};
        String[] QUERY = new String[]{"bbb", "ac", "dz"};
        int[] OUTPUT = new int[QUERY.length];

        for (int i = 0; i < QUERY.length; i++) {
                int countWordInQuery = 0;
                for (String input : INPUT) {
                    if (input.equals(QUERY[i])) {
                        countWordInQuery++;
                    }
                }
                OUTPUT[i] = countWordInQuery;
            }
            
        System.out.printf("OUTPUT = %s karena kata '%s' terdapat %d pada INPUT, kata '%s' tidak ada pada INPUT, dan kata '%s' terdapat %d pada INPUT"
            , Arrays.toString(OUTPUT), 
            QUERY[0], OUTPUT[0], 
            QUERY[1], 
            QUERY[2], OUTPUT[2]
        );
    }
}
