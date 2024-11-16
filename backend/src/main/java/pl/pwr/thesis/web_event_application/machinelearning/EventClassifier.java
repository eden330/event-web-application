package pl.pwr.thesis.web_event_application.machinelearning;

import opennlp.tools.doccat.DoccatFactory;
import opennlp.tools.doccat.DoccatModel;
import opennlp.tools.doccat.DocumentCategorizerME;
import opennlp.tools.doccat.DocumentSample;
import opennlp.tools.doccat.DocumentSampleStream;
import opennlp.tools.util.ObjectStream;
import opennlp.tools.util.PlainTextByLineStream;
import opennlp.tools.util.TrainingParameters;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import java.nio.file.Paths;

public class EventClassifier {

    private static final Path MODEL_FILE_PATH = Paths.get("backend/src/main/resources/model/event_classifier_model.bin");

    public static void main(String[] args) throws IOException {
        predictCategory("Intergenerational art workshop, the participants of which together will turn jasmine rice into a colorful material for creating fantastic, colorful paintings. Participants will dye the rice and make unusual colorful compositions out of it. Be prepared for a bit of mess, but that's okay - artists are not afraid of dirty hands. The class will be conducted by Michal Składanowski - a cultural animator.","");
    }

    public static String predictCategory(String description, String eventName) throws IOException {
        DoccatModel model = readModel();

        if (model == null) {
            model = trainModel();
            writeModel(model);
        }
        DocumentCategorizerME categorizer = new DocumentCategorizerME(model);

        String[] tokens = (eventName + " " + description).split("\\s+");
        double[] outcomes = categorizer.categorize(tokens);
        String category = categorizer.getBestCategory(outcomes);

        System.out.println("Event description: " + " " + eventName + " " + description);
        System.out.println("Predicted Category: " + category);

        System.out.println("Probability percentage for each category:");
        for (int i = 0; i < categorizer.getNumberOfCategories(); i++) {
            System.out.printf("%s: %.2f%%\n", categorizer.getCategory(i), outcomes[i] * 100);
        }

        return category;
    }

    private static DoccatModel readModel() {
        try (InputStream modelIn = EventClassifier.class.getResourceAsStream("/model/event_classifier_model.bin")) {
            if (modelIn != null) {
                System.out.println("Loaded model from resources.");
                return new DoccatModel(modelIn);
            } else {
                System.err.println("Model not found in resources; training a new model.");
                return null;
            }
        } catch (IOException e) {
            System.err.println("Failed to load model: " + e.getMessage());
            return null;
        }
    }

    private static void writeModel(DoccatModel model) {
        File saveFile = MODEL_FILE_PATH.toFile();
        saveFile.getParentFile().mkdirs();

        try (FileOutputStream fileOut = new FileOutputStream(saveFile)) {
            model.serialize(fileOut);
            System.out.println("Model saved to " + MODEL_FILE_PATH);
        } catch (IOException e) {
            System.err.println("Failed to save model: " + e.getMessage());
        }
    }

    private static DoccatModel trainModel() throws IOException {
        try (InputStream dataIn = EventClassifier.class.getResourceAsStream("/event_data.train")) {
            ObjectStream<DocumentSample> sampleStream = getDocumentSampleObjectStream(dataIn);

            DoccatFactory factory = new DoccatFactory();
            TrainingParameters mlParams = new TrainingParameters();
            mlParams.put(TrainingParameters.CUTOFF_PARAM, "1");

            System.out.println("Training a new model...");
            return DocumentCategorizerME.train("en", sampleStream, mlParams, factory);
        }
    }

    private static ObjectStream<DocumentSample> getDocumentSampleObjectStream(InputStream dataIn)
            throws IOException {
        if (dataIn == null) {
            throw new FileNotFoundException("Training file not found in resources: /event_data.train");
        }

        ObjectStream<String> lineStream = new PlainTextByLineStream(() -> dataIn, StandardCharsets.UTF_8);
        ObjectStream<String> formattedLineStream = () -> {
            String line = lineStream.read();
            return (line != null) ? line.replace("\\t", "\t") : null;
        };
        return new DocumentSampleStream(formattedLineStream);
    }
}
