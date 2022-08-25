package io.agora.metachat.example.ui.main;

import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.os.Bundle;
import android.util.Log;
import android.text.Editable;
import android.text.TextWatcher;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.AdapterView;
import android.widget.ProgressBar;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.constraintlayout.widget.ConstraintLayout;
import androidx.fragment.app.Fragment;
import androidx.lifecycle.LifecycleOwner;
import androidx.lifecycle.ViewModelProvider;

import com.afollestad.materialdialogs.MaterialDialog;
import com.zhy.http.okhttp.OkHttpUtils;
import com.zhy.http.okhttp.callback.StringCallback;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.Locale;

import coil.ImageLoaders;
import coil.request.ImageRequest;
import io.agora.metachat.example.KeyCenter;
import io.agora.metachat.example.MetaChatContext;
import io.agora.metachat.example.R;
import io.agora.metachat.example.adapter.SexAdapter;
import io.agora.metachat.example.databinding.MainFragmentBinding;
import io.agora.metachat.example.dialog.CustomDialog;
import io.agora.metachat.example.ui.game.GameActivity;
import io.agora.metachat.MetachatSceneInfo;
import okhttp3.Call;
import okhttp3.Request;

public class MainFragment extends Fragment implements View.OnClickListener {

    private final static String TAG = MainFragment.class.getName();
    private MainViewModel mViewModel;
    private MainFragmentBinding binding;
    

    public static MainFragment newInstance() {
        return new MainFragment();
    }

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container,
                             @Nullable Bundle savedInstanceState) {
        binding = MainFragmentBinding.inflate(inflater, container, false);
        binding.avatar.setOnClickListener(this);
        binding.nickname.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {
            }

            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {
            }

            @Override
            public void afterTextChanged(Editable s) {
                mViewModel.setNickname(s.toString());
            }
        });
        SexAdapter adapter = new SexAdapter(requireContext());
        binding.spinner.setAdapter(adapter);
        binding.spinner.setOnItemSelectedListener(new AdapterView.OnItemSelectedListener() {
            @Override
            public void onItemSelected(AdapterView<?> adapterView, View view, int i, long l) {
                adapter.check(i);
                mViewModel.setSex(adapter.getItem(i).toString());
            }

            @Override
            public void onNothingSelected(AdapterView<?> adapterView) {
            }
        });
        binding.enter.setOnClickListener(this);
        return binding.getRoot();
    }

    @Override
    public void onActivityCreated(@Nullable Bundle savedInstanceState) {
        super.onActivityCreated(savedInstanceState);
        mViewModel = new ViewModelProvider(this).get(MainViewModel.class);
        LifecycleOwner owner = getViewLifecycleOwner();
        Context context = requireContext();
        mViewModel.getAvatar().observe(owner, charSequence -> {
            ImageRequest request = new ImageRequest.Builder(context)
                    .data(charSequence)
                    .target(binding.avatar)
                    .build();
            ImageLoaders.create(context)
                    .enqueue(request);
        });
        mViewModel.getNickname().observe(owner, charSequence -> {
            if (charSequence.length() < 2 || charSequence.length() > 10) {
                binding.tips.setVisibility(View.VISIBLE);
            } else {
                binding.tips.setVisibility(View.GONE);
            }
        });
        mViewModel.getSex().observe(owner, charSequence -> {
            binding.sex.setText(charSequence);
        });
       // Log.e("progress$$$$$$    ","1111111113333333333111111");


        mViewModel.getSceneList().observe(owner, metachatSceneInfos -> {
            // TODO choose one
            Log.e("progress$$$$$$    ", String.valueOf(metachatSceneInfos.size()));
            if (metachatSceneInfos.size() > 0){
                MetachatSceneInfo item = metachatSceneInfos.get(0);
                Log.e("progress$$$$$$    ", String.valueOf(item.mScenePath));
                mViewModel.prepareScene(metachatSceneInfos.get(0));

            }

        });
        mViewModel.getSelectScene().observe(owner, sceneInfo -> {
            if (progressDialog != null) {
                progressDialog.dismiss();
                progressDialog = null;
            }

            Intent intent = new Intent(context, GameActivity.class);
            intent.addFlags(Intent.FLAG_ACTIVITY_REORDER_TO_FRONT);
            intent.putExtra("nickname", mViewModel.getNickname().getValue());
            intent.putExtra("avatar", mViewModel.getAvatar().getValue());
            intent.putExtra("roomName", KeyCenter.CHANNEL_ID);
            startActivity(intent);
        });
        mViewModel.getRequestDownloading().observe(owner, aBoolean -> {
            if (aBoolean) {
                CustomDialog.showDownloadingChooser(context, materialDialog -> {
                    mViewModel.downloadScene(mViewModel.getSceneList().getValue().get(0));
                    return null;
                }, null);
            }
        });
        mViewModel.getDownloadingProgress().observe(owner, integer -> {
            if (progressDialog == null) {
                progressDialog = CustomDialog.showDownloadingProgress(context, materialDialog -> {
                    mViewModel.cancelDownloadScene(mViewModel.getSceneList().getValue().get(0));
                    return null;
                });
            }
            else if(integer < 0){
                progressDialog.dismiss();
                progressDialog = null;
                return;
            }

            ConstraintLayout constraintLayout = CustomDialog.getCustomView(progressDialog);
            ProgressBar progressBar = constraintLayout.findViewById(R.id.progressBar);
            TextView textView = constraintLayout.findViewById(R.id.textView);
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                progressBar.setProgress(integer, true);
            } else {
                progressBar.setProgress(integer);
            }
            textView.setText(String.format(Locale.getDefault(), "%d%%", integer));
        });
    }

    private MaterialDialog progressDialog;

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        binding = null;
    }

    @Override
    public void onClick(View v) {
        switch (v.getId()) {
            case R.id.avatar:
                CustomDialog.showAvatarPicker(requireContext(), charSequence -> {
                    mViewModel.setAvatar(charSequence.toString());
                    return null;
                }, null, null);
                break;
            case R.id.enter:

                String url = "https://www.tingwx.com/index/?tp=agoratoken";
                OkHttpUtils
                        .get()
                        .url(url)
                        .build()
                        .execute(new StringCallback()
                        {
                            @Override
                            public void onError(Call call, Exception e, int id) {

                            }

                            @Override
                            public void onResponse(String response, int id) {
                                Log.e(TAG, "onResponse okhttp : " + response);
                                try {
                                    JSONObject jsonobj = new JSONObject(response);
                                    Log.e(TAG, "onResponse okhttp : " + jsonobj.get("rtctoken").toString());
                                    Log.e(TAG, "onResponse okhttp : " + jsonobj.get("rtmtoken").toString());
                                    mViewModel.getScenes(jsonobj.get("rtctoken").toString(),jsonobj.get("rtmtoken").toString());
                                    
                                 /*   mViewModel.getScenes("0069603df909bf0464f9959209d086d42f6IACHFOSUb5LtPBELtk8x/OHBxQEdZ8oi+2po/uw3fCkg5ArCxmsAAAAAEAASvOWQIR79YgEAAQAfHv1i",
                                    "0069603df909bf0464f9959209d086d42f6IAAl8p+zFTPiuEhmBqAvl9wo1avTTb/hwQ+HSJklAJhjWvz4YykAAAAAEABeJ3ktZh79YgEA6ANmHv1i"
                                    );*/
                                }
                                catch (Exception e) {
                                    Log.e(TAG, "exception&&&&&&&&&&&&&&&");
                                    Log.e(TAG, "exception&&&&&&&&&&&&&&&");
                                    Log.e(TAG, e.toString());
                                    e.printStackTrace();
                                }
                            }


                        });

                break;
            default:
                break;
        }
    }

    
}