package pl.pwr.thesis.web_event_application.machinelearning;

import opennlp.tools.doccat.DoccatFactory;
import opennlp.tools.doccat.DoccatModel;
import opennlp.tools.doccat.DocumentCategorizerME;
import opennlp.tools.doccat.DocumentSample;
import opennlp.tools.doccat.DocumentSampleStream;
import opennlp.tools.util.ObjectStream;
import opennlp.tools.util.PlainTextByLineStream;
import opennlp.tools.util.TrainingParameters;

import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.ObjectInputStream;
import java.io.ObjectOutputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import java.nio.file.Paths;

public class EventClassifier {

    private static final Path MODEL_FILE_PATH = Paths.get("event_classifier_model.bin");

    public static String predictCategory(String description) throws IOException {
        DoccatModel model = readModel();

        if (model == null) {
            model = trainModel();
            writeModel(model);
        }
        DocumentCategorizerME categorizer = new DocumentCategorizerME(model);

        String[] tokens = description.split("\\s+");
        double[] outcomes = categorizer.categorize(tokens);
        String category = categorizer.getBestCategory(outcomes);

        System.out.println("Predicted Category: " + category);

        return category;
    }

    private static DoccatModel readModel() {
        try (InputStream fileIn = EventClassifier.class.getResourceAsStream("/event_classifier_model.bin")) {
            if (fileIn != null) {
                ObjectInputStream objectIn = new ObjectInputStream(fileIn);
                System.out.println("Loaded model from resources");
                return (DoccatModel) objectIn.readObject();
            }
        } catch (IOException | ClassNotFoundException e) {
            System.err.println("Failed to load model: " + e.getMessage());
        }
        return null;
    }

    private static void writeModel(DoccatModel model) {
        try (FileOutputStream fileOut = new FileOutputStream(MODEL_FILE_PATH.toFile());
             ObjectOutputStream objectOut = new ObjectOutputStream(fileOut)) {
            objectOut.writeObject(model);
            System.out.println("The model was successfully saved to " + MODEL_FILE_PATH);
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
