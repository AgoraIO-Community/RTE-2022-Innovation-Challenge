import plotly.graph_objects as go
# Create random data with numpy
import numpy as np

np.random.seed(1)

color_dict = dict()
def set_color_dict():
    ''''''
    '''眼睛: blue'''
    color_dict["e1"] = "rgb(70,130,180)"
    color_dict["e2"] = "rgb(0,245,255)"
    color_dict["e3"] = "rgb(0,191,255)"

    '''头部姿态: green'''
    color_dict["h1"] = "rgb(46,139,87)"
    color_dict["h2"] = "rgb(0,255,0)"
    color_dict["h3"] = "rgb(107,142,35)"
    color_dict["h4"] = "rgb(143,188,143)"

    '''嘴巴: red'''
    color_dict["m1"] = "rgb(178,34,34)"
    color_dict["m2"] = "rgb(255,106,106)"

    '''眉毛: 粉色'''
    color_dict["b1"] = "rgb(131,111,255)"
    color_dict["b2"] = "rgb(238,48,167)"
    color_dict["b3"] = "rgb(255,181,197)"

'''plotly绘制折线图'''
def behaviors_linePlot(df,img_savePath):

    set_color_dict()

    x, y_dict = df_preprocess(df)

    # Create traces
    fig = go.Figure()

    for key in y_dict.keys():
        y = y_dict[key]
        fig.add_trace(go.Scatter(
            x=x, y=y,
            mode='lines',
            name=key,
            line=dict(color=color_dict[key])
            )
        )

    fig.update_layout(
        font_size=18,
        yaxis = dict(
            showgrid=False,
            zeroline=False,
            showline=False,
            showticklabels=False,
        ),
        xaxis = dict(
            title="frame_count",
        )
    )

    fig.write_image(img_savePath, engine="kaleido")
    # fig.show()


def df_preprocess(df):
    '''
    :param df: diagnosis_table type=Dataframe
    :return: x type=list()
             y type=dict()
    '''
    y_dict = dict()  #y值即(0,1)表示，规定眨眼，头部姿态，嘴巴，眉毛的折线值域分别为[0,1], [1,2], [2,3], [3,4]
    columns = df.columns.values.tolist()
    columns.remove("date")
    columns.remove("kss")
    x = [i for i in range(len(df))]
    for index,column in enumerate(columns):
        if(column not in y_dict.keys()):
            y_dict[column] = []
        #遍历column整一列，封装为list
        y_dict[column] = (df[column] + index * 2).tolist()

    return x, y_dict