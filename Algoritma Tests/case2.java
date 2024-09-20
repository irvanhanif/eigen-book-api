/**
 * case2
 */
public class case2 {
    public static void main(String[] args) {
        String sentence = "Saya sangat senang mengerjakan soal algoritma";
        longest(sentence);
    }

    private static void longest(String sentence) {
        String longWord = "";
        String [] sentenceByWords = sentence.split(" ");
        
        for (String word : sentenceByWords) {
            if (word.length() > longWord.length()) {
                longWord = word;
            }
        }

        System.out.printf("%s : %d character", longWord, longWord.length());
    }
}
