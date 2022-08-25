package com.lee.baiduvoicedemo;

import android.app.Activity;
import android.app.AlertDialog;
import android.app.ListActivity;
import android.content.DialogInterface;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.widget.ArrayAdapter;
import android.widget.ListAdapter;
import android.widget.SimpleAdapter;
import android.widget.TextView;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * @类名: ${type_name}
 * @功能描述:
 * @作者: ${user}
 * @时间: ${date}
 * @最后修改者:
 * @最后修改内容:
 */
public class SynthSetting extends Activity implements View.OnClickListener {

    private TextView speaker, volum, speed, pitch;
    private ArrayAdapter<String> adapter1;
    private ArrayAdapter<String> adapter2;
    private String[] data1={"0","1","2","3","4","5","6","7","8","9"};
    private String[] data2={"普通女声","普通男声","特别男声","情感男声","情感儿童女声"};
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.synth_setting);
        
        speaker = (TextView) findViewById(R.id.speaker);
        volum = (TextView) findViewById(R.id.volum);
        speed = (TextView) findViewById(R.id.speed);
        pitch = (TextView) findViewById(R.id.pitch);

        speaker.setText("说话人：" + data2[Constant.speaker]);
        volum.setText("音量：" + Constant.volume);
        speed.setText("速度：" + Constant.speed);
        pitch.setText("音调：" + Constant.pitch);
        
        speaker.setOnClickListener(this);
        volum.setOnClickListener(this);
        speed.setOnClickListener(this);
        pitch.setOnClickListener(this);
        
        adapter1 = new ArrayAdapter<String>(this, android.R.layout.simple_list_item_1, data1);
        adapter2 = new ArrayAdapter<String>(this, android.R.layout.simple_list_item_1, data2);
        
        
    }
    
    
    @Override
    public void onClick(View v) {
        switch (v.getId()){
            case R.id.speaker:
                speakerDialog();
                break;
            case R.id.volum:
                dialog("volum");
                break;
            case R.id.speed:
                dialog("speed");
                break;
            case R.id.pitch:
                dialog("pitch");
                break;
        }
    }
    
    public void dialog(final String flag){
        AlertDialog.Builder builder = new AlertDialog.Builder(this);
        builder.setIcon(R.drawable.ic_launcher);
        builder.setTitle("请选择：");
        builder.setAdapter(adapter1, new DialogInterface.OnClickListener() {
            @Override
            public void onClick(DialogInterface dialog, int which) {
                // TODO Auto-generated method stub
                if ("volum".equals(flag)){
                    Constant.volume = which;
                    volum.setText("音量：" + which);
                } else if ("speed".equals(flag)){
                    Constant.speed = which;
                    speed.setText("速度：" + which);
                } else if ("pitch".equals(flag)){
                    Constant.pitch = which;
                    pitch.setText("音调：" + which);
                }
            }
        });
        builder.show();
    }

    public void speakerDialog(){
        AlertDialog.Builder builder = new AlertDialog.Builder(this);
        builder.setIcon(R.drawable.ic_launcher);
        builder.setTitle("请选择：");
        builder.setAdapter(adapter2, new DialogInterface.OnClickListener() {
            @Override
            public void onClick(DialogInterface dialog, int which) {
                // TODO Auto-generated method stub
                Constant.speaker = which;
                speaker.setText("说话人：" + data2[which]);
            }
        });
        builder.show();
    }
        
}
//jhfghfh