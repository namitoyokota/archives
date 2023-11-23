# Mask Detector
> comparing two object detection algorithms - Mobilenet and R-CNN - for detecting and classifying face masks in images

## Project Proposal
Face Mask Object Detection using Deep Learning. Oftentimes, in public buildings, a worker is checking that the incoming individuals are wearing face masks properly. Using data science and machine learning, this problem can be solved in a more efficient manner. We plan to use a public dataset posted on Kaggle with images of people with different genders and races wearing different types of face masks: https://www.kaggle.com/andrewmvd/face-mask-detection

## Goal
The goal was to investigate the following questions:
* How do R-CNN and Mobinet compare with each other in detection accuracy?
* How do R-CNN and Mobinet compare with each other in efficiency?
* How do R-CNN and Mobinet compare with each other in computational cost?

## Dataset
This dataset contains 853 png images with each target in the images categorized in one of the three classes: with mask, without mask, or mask worn incorrectly. Due to limits of RAM with Google Colab, we sized down the input dataset for this deliverable to 100 images and 100 annotations. The bounding boxes for these classes are provided in the annotations directory using the PASCAL VOC format. Each annotation XML file contains information about the dimensions of the corresponding image and the bounding box (xmin, ymin, xmax, ymax) along with the class for the targeted faces. We used the 80:20 ratio for the train:test.

The parameters used for the training of the model are:
* Learning Rate: 1e-4
* Epochs: 10
* Batch Size: 10

## Evaluation Metric
To evaluate the effectiveness of our solution, we will use the weighted average F1 score and average.

## Preliminary Result

### Visual Pattern Output
| Model       |  Output                            |
| ----------- | ---------------------------------- |
| Mobilenet   | ![Mobilenet](/imgs/mobilenet.png)  |
| R-CNN       | ![R-CNN](/imgs/rcnn.png)           |

### Quantitive Metrics

#### Mobilenet
               precision    recall  f1-score   support

           0       0.50      0.73      0.59        11
           1       0.94      0.90      0.92        81
           2       1.00      0.33      0.50         3

    accuracy                           0.86        95
    macro avg      0.81      0.65      0.67        95
    weighted avg   0.89      0.86      0.87        95


#### RCNN
                precision    recall  f1-score   support

           0       0.96      1.00      0.98       387
           1       0.99      0.80      0.89        82
           2       1.00      1.00      1.00         3

    accuracy                           0.96       472
    macro avg      0.98      0.93      0.95       472
    weighted avg   0.96      0.96      0.96       472

## Conclusion
In conclusion, because the statistic we found most important was the accuracy of the algorithm and its F1 score, RCNN is the superior algorithm for our purposes. Although Mobilenet has its pros, it is not ideal for our purposes as being accurate is more important to us than being quick. 